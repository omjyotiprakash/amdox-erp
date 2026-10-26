process.env.AUTH_RATE_LIMIT = "1000";
process.env.BCRYPT_ROUNDS = "4";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const app = require("../src/app");
const Role = require("../src/models/Role");

let server;
let mongo;
let base;
let adminToken;
let anaToken; // Employee role, linked to an HR record by email
let benToken; // Employee role, linked to a different HR record
let strayToken; // Employee role with NO HR record
const ids = {};

const call = async (path, { method = "GET", body, token = adminToken } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  // the first sign-up becomes Admin (allowed while no users exist); the rest are created by the Admin
  const first = await call("/auth/register", {
    method: "POST",
    token: null,
    body: { name: "Admin", email: "admin@example.com", password: "supersecret1" },
  });
  adminToken = first.body.data.token;

  const roles = (await call("/settings/roles")).body.data.items;
  const employeeRole = roles.find((role) => role.name === "Employee").id;

  const makeLogin = async (name, email) => {
    await call("/settings/users", { method: "POST", body: { name, email, password: "password123", roleId: employeeRole } });
    return (await call("/auth/login", { method: "POST", token: null, body: { email, password: "password123" } })).body.data.token;
  };
  anaToken = await makeLogin("Ana", "ana@amdox.com");
  benToken = await makeLogin("Ben", "ben@amdox.com");
  strayToken = await makeLogin("Stray", "stray@amdox.com");

  const hire = async (name, email, salary) =>
    (await call("/hr/employees", {
      method: "POST",
      body: { name, email, department: "Eng", jobTitle: "Dev", joinedOn: "2025-01-01", basicSalary: salary, deductions: 1000 },
    })).body.data.employee.id;
  ids.ana = await hire("Ana", "Ana@Amdox.com", 50000); // email case differs on purpose
  ids.ben = await hire("Ben", "ben@amdox.com", 80000);
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("self-service needs a login, not an HR permission", async () => {
  for (const path of ["/me/profile", "/me/attendance", "/me/leave", "/me/payslips"]) {
    assert.equal((await call(path, { token: null })).status, 401, path);
    assert.equal((await call(path, { token: anaToken })).status, 200, path);
  }
  // ...while the HR pages stay closed to an Employee
  assert.equal((await call("/hr/employees", { token: anaToken })).status, 403);
  assert.equal((await call("/hr/payroll", { token: anaToken })).status, 403);
});

test("profile is linked by work email, and unlinked accounts are told what to do", async () => {
  const mine = (await call("/me/profile", { token: anaToken })).body.data;
  assert.equal(mine.linked, true);
  assert.equal(mine.employee.name, "Ana");
  assert.equal(mine.employee.basicSalary, 50000);

  const stray = (await call("/me/profile", { token: strayToken })).body.data;
  assert.equal(stray.linked, false);
  assert.equal(stray.employee, null);
  assert.equal(stray.email, "stray@amdox.com");

  assert.deepEqual((await call("/me/leave", { token: strayToken })).body.data.items, []);
  const blocked = await call("/me/leave", {
    method: "POST",
    token: strayToken,
    body: { type: "Casual Leave", from: isoDate(5), to: isoDate(6) },
  });
  assert.equal(blocked.status, 404);
  assert.match(blocked.body.message, /stray@amdox\.com/);
});

test("attendance shows only my own records for the chosen month", async () => {
  const mark = (employeeId, status, date = isoDate(0)) =>
    call("/hr/attendance", { method: "PUT", body: { employeeId, date, status, checkIn: "09:00" } });
  await mark(ids.ana, "Present");
  await mark(ids.ben, "Absent"); // another person's record

  const mine = (await call("/me/attendance", { token: anaToken })).body.data;
  assert.ok(mine.items.length >= 1);
  assert.ok(mine.items.every((item) => item.status !== "Absent")); // Ben's record never leaks in
  assert.equal(mine.summary.absent, 0);

  const bens = (await call("/me/attendance", { token: benToken })).body.data;
  assert.equal(bens.summary.absent, 1);
  assert.equal(bens.summary.present, 0);

  const empty = (await call("/me/attendance?month=2020-01", { token: anaToken })).body.data;
  assert.deepEqual(empty.items, []);
  assert.equal((await call("/me/attendance?month=nope", { token: anaToken })).status, 400);
});

test("leave: request for myself, see only mine, cancel while pending", async () => {
  const request = (token, body) => call("/me/leave", { method: "POST", token, body });
  const dates = { type: "Casual Leave", from: isoDate(10), to: isoDate(12) };

  const created = await request(anaToken, dates);
  assert.equal(created.status, 201);
  assert.equal(created.body.data.leave.days, 3);
  assert.equal(created.body.data.leave.status, "Pending");
  ids.anaLeave = created.body.data.leave.id;

  // an employeeId in the request is ignored: it still lands on the caller's own record
  const sneaky = await request(benToken, { ...dates, employeeId: ids.ana });
  assert.equal(sneaky.status, 201);
  assert.equal(sneaky.body.data.leave.employee.name, "Ben");
  ids.benLeave = sneaky.body.data.leave.id;

  assert.equal((await request(anaToken, { ...dates, from: isoDate(11) })).status, 409); // overlaps my own
  assert.equal((await request(anaToken, { type: "Vacation", from: isoDate(1), to: isoDate(2) })).status, 400);
  assert.equal((await request(anaToken, { type: "Sick Leave", from: isoDate(5), to: isoDate(4) })).status, 400);

  const mine = (await call("/me/leave", { token: anaToken })).body.data;
  assert.deepEqual(mine.items.map((item) => item.id), [ids.anaLeave]);
  assert.equal(mine.summary.pending, 1);

  // HR sees both and can approve; my list updates
  assert.equal((await call("/hr/leave")).body.data.items.length, 2);
  await call(`/hr/leave/${ids.anaLeave}/decision`, { method: "PATCH", body: { status: "Approved" } });
  const decided = (await call("/me/leave", { token: anaToken })).body.data;
  assert.deepEqual([decided.summary.approved, decided.summary.approvedDays], [1, 3]);

  // cancel rules: not someone else's, not once decided
  assert.equal((await call(`/me/leave/${ids.benLeave}`, { method: "DELETE", token: anaToken })).status, 404);
  assert.equal((await call(`/me/leave/${ids.anaLeave}`, { method: "DELETE", token: anaToken })).status, 409);
  assert.equal((await call(`/me/leave/${ids.benLeave}`, { method: "DELETE", token: benToken })).status, 200);
  assert.equal((await call("/me/leave", { token: benToken })).body.data.items.length, 0);
});

test("payslips: only mine", async () => {
  const month = isoDate(0).slice(0, 7);
  await call("/hr/payroll/generate", { method: "POST", body: { month } });

  const ana = (await call("/me/payslips", { token: anaToken })).body.data;
  assert.equal(ana.items.length, 1);
  assert.deepEqual([ana.items[0].month, ana.items[0].netSalary], [month, 49000]);

  const ben = (await call("/me/payslips", { token: benToken })).body.data;
  assert.equal(ben.items[0].netSalary, 79000); // Ben sees Ben's, never Ana's
  assert.equal((await call("/me/payslips", { token: strayToken })).body.data.items.length, 0);
});

test("self-service changes are recorded in the audit log", async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const rows = (await call("/settings/audit?search=me/leave")).body.data.items;
  assert.ok(rows.some((row) => row.action === "create" && row.userName === "Ana"));
});
