process.env.AUTH_RATE_LIMIT = "1000";
process.env.BCRYPT_ROUNDS = "4";
process.env.ALLOW_PUBLIC_REGISTRATION = "true"; // these tests create users by self-registering

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
let employeeToken;
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

const newEmployee = (overrides = {}) => ({
  name: "Aarav Sharma",
  email: "aarav@amdox.com",
  department: "Engineering",
  jobTitle: "Software Engineer",
  joinedOn: "2025-02-10",
  basicSalary: 65000,
  deductions: 5000,
  ...overrides,
});

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  const register = async (name, email) =>
    (await call("/auth/register", { method: "POST", token: null, body: { name, email, password: "supersecret1" } })).body.data
      .token;
  adminToken = await register("Admin", "admin@example.com");
  employeeToken = await register("Emp", "emp@example.com");
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("HR endpoints require login and hr permission", async () => {
  for (const path of ["/hr/employees", "/hr/attendance", "/hr/leave", "/hr/payroll"]) {
    assert.equal((await call(path, { token: null })).status, 401, path);
    assert.equal((await call(path, { token: employeeToken })).status, 403, path);
  }
});

test("employees: create, validate, duplicate email, list, filter, update", async () => {
  const a = await call("/hr/employees", { method: "POST", body: newEmployee() });
  assert.equal(a.status, 201);
  assert.equal(a.body.data.employee.code, "EMP-1001");
  assert.equal(a.body.data.employee.joinedOn, "2025-02-10");
  ids.aarav = a.body.data.employee.id;

  const b = await call("/hr/employees", {
    method: "POST",
    body: newEmployee({ name: "Priya Patel", email: "Priya@Amdox.com", department: "Human Resources", jobTitle: "HR Manager", basicSalary: 58000, deductions: 4000 }),
  });
  ids.priya = b.body.data.employee.id;
  assert.equal(b.body.data.employee.email, "priya@amdox.com");

  const c = await call("/hr/employees", {
    method: "POST",
    body: newEmployee({ name: "Vikram Rao", email: "vikram@amdox.com", status: "Inactive", basicSalary: 62000, deductions: 4500 }),
  });
  ids.vikram = c.body.data.employee.id;

  assert.equal((await call("/hr/employees", { method: "POST", body: newEmployee() })).status, 409);
  assert.equal(
    (await call("/hr/employees", { method: "POST", body: newEmployee({ email: "x@amdox.com", basicSalary: 1000, deductions: 2000 }) })).status,
    400
  );
  assert.equal((await call("/hr/employees", { method: "POST", body: newEmployee({ email: "bad" }) })).status, 400);

  const all = await call("/hr/employees");
  assert.equal(all.body.data.items.length, 3);
  assert.deepEqual(all.body.data.summary, { total: 3, active: 2, onLeave: 0 });
  assert.deepEqual(all.body.data.departments, ["Engineering", "Human Resources"]);

  assert.equal((await call("/hr/employees?department=Engineering")).body.data.items.length, 2);
  assert.equal((await call("/hr/employees?status=Inactive")).body.data.items[0].name, "Vikram Rao");
  assert.equal((await call("/hr/employees?search=priya")).body.data.items.length, 1);

  const updated = await call(`/hr/employees/${ids.aarav}`, { method: "PUT", body: { status: "On Leave" } });
  assert.equal(updated.body.data.employee.status, "On Leave");
  assert.equal(updated.body.data.employee.basicSalary, 65000); // untouched fields kept
  await call(`/hr/employees/${ids.aarav}`, { method: "PUT", body: { status: "Active" } });
  assert.equal((await call(`/hr/employees/${ids.aarav}`, { method: "PUT", body: { deductions: 99999999 } })).status, 400);
});

test("attendance: mark, daily roster, checkout, absent clears times, guards", async () => {
  const date = isoDate(0);
  const mark = (body) => call("/hr/attendance", { method: "PUT", body: { date, ...body } });

  assert.equal((await mark({ employeeId: ids.aarav, status: "Present", checkIn: "09:02" })).status, 200);
  assert.equal((await mark({ employeeId: ids.aarav, status: "Present", checkOut: "18:05" })).status, 200);
  await mark({ employeeId: ids.priya, status: "Late", checkIn: "09:35" });

  let day = (await call(`/hr/attendance?date=${date}`)).body.data;
  assert.equal(day.items.length, 2); // Vikram is inactive, so not on the roster
  const aarav = day.items.find((i) => i.name === "Aarav Sharma");
  assert.deepEqual([aarav.status, aarav.checkIn, aarav.checkOut], ["Present", "09:02", "18:05"]);
  assert.deepEqual(day.summary, { present: 1, late: 1, absent: 0, onLeave: 0, notMarked: 0, total: 2 });

  await mark({ employeeId: ids.aarav, status: "Absent" });
  day = (await call(`/hr/attendance?date=${date}`)).body.data;
  const absent = day.items.find((i) => i.name === "Aarav Sharma");
  assert.deepEqual([absent.status, absent.checkIn, absent.checkOut], ["Absent", "", ""]);

  const other = (await call(`/hr/attendance?date=${isoDate(-1)}`)).body.data;
  assert.equal(other.summary.notMarked, 2);
  assert.equal(other.items[0].status, "Not marked");

  assert.equal((await mark({ employeeId: ids.vikram, status: "Present" })).status, 400); // inactive
  assert.equal((await call("/hr/attendance", { method: "PUT", body: { employeeId: ids.aarav, date: isoDate(10), status: "Present" } })).status, 400);
  assert.equal((await mark({ employeeId: ids.aarav, status: "Present", checkIn: "25:99" })).status, 400);
  assert.equal((await call("/hr/attendance?date=nope")).status, 400);
});

test("leave: days, overlap, validation, decisions, search, summary", async () => {
  const request = (body) =>
    call("/hr/leave", { method: "POST", body: { employeeId: ids.aarav, type: "Casual Leave", from: isoDate(5), to: isoDate(6), ...body } });

  const first = await request();
  assert.equal(first.status, 201);
  assert.equal(first.body.data.leave.code, "LV-1001");
  assert.equal(first.body.data.leave.days, 2);
  assert.equal(first.body.data.leave.status, "Pending");
  assert.equal(first.body.data.leave.employee.name, "Aarav Sharma");
  ids.leave1 = first.body.data.leave.id;

  assert.equal((await request({ from: isoDate(6), to: isoDate(8) })).status, 409); // overlaps
  assert.equal((await request({ from: isoDate(9), to: isoDate(8) })).status, 400); // ends before it starts
  assert.equal((await request({ type: "Vacation" })).status, 400);
  assert.equal((await request({ employeeId: ids.vikram, from: isoDate(20), to: isoDate(20) })).status, 400); // inactive

  const long = await request({ employeeId: ids.priya, type: "Annual Leave", from: isoDate(10), to: isoDate(14) });
  assert.equal(long.body.data.leave.days, 5);
  ids.leave2 = long.body.data.leave.id;

  const approved = await call(`/hr/leave/${ids.leave1}/decision`, { method: "PATCH", body: { status: "Approved" } });
  assert.equal(approved.body.data.leave.status, "Approved");
  assert.equal((await call(`/hr/leave/${ids.leave1}/decision`, { method: "PATCH", body: { status: "Rejected" } })).status, 409);
  assert.equal((await call(`/hr/leave/${ids.leave2}/decision`, { method: "PATCH", body: { status: "Maybe" } })).status, 400);
  await call(`/hr/leave/${ids.leave2}/decision`, { method: "PATCH", body: { status: "Rejected" } });

  // a rejected request frees the dates up again
  assert.equal((await request({ employeeId: ids.priya, from: isoDate(10), to: isoDate(11) })).status, 201);

  const list = (await call("/hr/leave")).body.data;
  assert.deepEqual(list.summary, { total: 3, pending: 1, approved: 1, approvedDays: 2 });
  assert.equal((await call("/hr/leave?status=Approved")).body.data.items.length, 1);
  assert.equal((await call("/hr/leave?search=priya")).body.data.items.length, 2); // by employee name
  assert.equal((await call("/hr/leave?search=casual")).body.data.items.length, 2); // by leave type

  assert.equal((await call(`/hr/leave/${ids.leave1}`, { method: "DELETE" })).status, 409); // not pending
  const pending = list.items.find((i) => i.status === "Pending");
  assert.equal((await call(`/hr/leave/${pending.id}`, { method: "DELETE" })).status, 200);
});

test("payroll: generate is idempotent, snapshots salary, status flow, search", async () => {
  const month = isoDate(0).slice(0, 7);
  const gen = await call("/hr/payroll/generate", { method: "POST", body: { month } });
  assert.equal(gen.status, 201);
  assert.deepEqual(gen.body.data, { created: 2, alreadyExisted: 0 }); // inactive Vikram excluded

  const again = await call("/hr/payroll/generate", { method: "POST", body: { month } });
  assert.deepEqual(again.body.data, { created: 0, alreadyExisted: 2 });
  assert.equal((await call("/hr/payroll/generate", { method: "POST", body: { month: "2026-13" } })).status, 400);

  let list = (await call(`/hr/payroll?month=${month}`)).body.data;
  assert.equal(list.items.length, 2);
  assert.deepEqual(list.summary, { totalNet: 60000 + 54000, paid: 0, pendingCount: 2 });
  const aarav = list.items.find((i) => i.employee.name === "Aarav Sharma");
  assert.deepEqual([aarav.code, aarav.basicSalary, aarav.deductions, aarav.netSalary], ["PAY-1001", 65000, 5000, 60000]);

  // changing salary later must not rewrite existing payroll
  await call(`/hr/employees/${ids.aarav}`, { method: "PUT", body: { basicSalary: 90000 } });
  list = (await call(`/hr/payroll?month=${month}`)).body.data;
  assert.equal(list.items.find((i) => i.employee.name === "Aarav Sharma").netSalary, 60000);

  const processing = await call(`/hr/payroll/${aarav.id}/status`, { method: "PATCH", body: { status: "Processing" } });
  assert.equal(processing.body.data.payroll.status, "Processing");
  assert.equal((await call(`/hr/payroll/${aarav.id}/status`, { method: "PATCH", body: { status: "Processing" } })).status, 409);
  const paid = await call(`/hr/payroll/${aarav.id}/status`, { method: "PATCH", body: { status: "Paid" } });
  assert.equal(paid.body.data.payroll.status, "Paid");
  assert.equal((await call(`/hr/payroll/${aarav.id}/status`, { method: "PATCH", body: { status: "Processing" } })).status, 409); // Paid is final
  assert.equal((await call(`/hr/payroll/${aarav.id}/status`, { method: "PATCH", body: { status: "Pending" } })).status, 400);

  list = (await call(`/hr/payroll?month=${month}`)).body.data;
  assert.deepEqual(list.summary, { totalNet: 114000, paid: 60000, pendingCount: 1 });
  assert.equal((await call(`/hr/payroll?month=${month}&status=Paid`)).body.data.items.length, 1);
  assert.equal((await call(`/hr/payroll?month=${month}&search=priya`)).body.data.items.length, 1);
  assert.equal((await call("/hr/payroll?month=2020-01")).body.data.items.length, 0);

  // a second month works independently
  assert.equal((await call("/hr/payroll/generate", { method: "POST", body: { month: "2026-01" } })).body.data.created, 2);
});

test("employee deletion is blocked once there is history", async () => {
  assert.equal((await call(`/hr/employees/${ids.aarav}`, { method: "DELETE" })).status, 409);
  assert.equal((await call(`/hr/employees/${ids.vikram}`, { method: "DELETE" })).status, 200); // no records
  assert.equal((await call(`/hr/employees/${ids.vikram}`, { method: "DELETE" })).status, 404);
});
