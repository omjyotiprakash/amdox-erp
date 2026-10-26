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
let admin;
let hr1; // HR staff, also has an HR employee record of their own
let hr2; // a second HR person
const ids = {};

const call = async (path, { method = "GET", body, token } = {}) => {
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

let dayCounter = 0;
const nextDates = () => {
  dayCounter += 4;
  return { type: "Casual Leave", from: isoDate(dayCounter), to: isoDate(dayCounter + 1) };
};

const createLeave = (token, employeeId) =>
  call("/hr/leave", { method: "POST", token, body: { employeeId, ...nextDates() } });
const decide = (token, id, status = "Approved") =>
  call(`/hr/leave/${id}/decision`, { method: "PATCH", token, body: { status } });
const view = async (token, id) => (await call("/hr/leave?limit=100", { token })).body.data.items.find((item) => item.id === id);

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  admin = (await call("/auth/register", {
    method: "POST",
    body: { name: "Admin", email: "admin@example.com", password: "supersecret1" },
  })).body.data.token;

  const role = (await call("/settings/roles", { method: "POST", token: admin, body: { name: "HR Staff" } })).body.data.role;
  await call(`/settings/roles/${role.id}/permissions`, {
    method: "PUT",
    token: admin,
    body: { permissions: { hr: { view: true, create: true, edit: true } } },
  });

  const makeLogin = async (name, email) => {
    await call("/settings/users", { method: "POST", token: admin, body: { name, email, password: "password123", roleId: role.id } });
    return (await call("/auth/login", { method: "POST", body: { email, password: "password123" } })).body.data.token;
  };
  hr1 = await makeLogin("Hana HR", "hana@amdox.com");
  hr2 = await makeLogin("Hugo HR", "hugo@amdox.com");

  const hire = async (name, email) =>
    (await call("/hr/employees", {
      method: "POST",
      token: admin,
      body: { name, email, department: "HR", jobTitle: "Staff", joinedOn: "2025-01-01" },
    })).body.data.employee.id;
  ids.priya = await hire("Priya", "priya@amdox.com"); // an ordinary employee
  ids.hana = await hire("Hana HR", "hana@amdox.com"); // matches hr1's login
  ids.owner = await hire("Owner", "admin@example.com"); // matches the Admin's login
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("the person who added a request cannot approve it, but a colleague can", async () => {
  const created = await createLeave(hr1, ids.priya);
  assert.equal(created.status, 201);
  const id = created.body.data.leave.id;

  const mine = await view(hr1, id);
  assert.equal(mine.canDecide, false);
  assert.match(mine.blockedReason, /you added this request/i);

  const blocked = await decide(hr1, id);
  assert.equal(blocked.status, 403);
  assert.match(blocked.body.message, /someone else needs to approve/i);
  assert.equal((await view(hr2, id)).status, "Pending"); // nothing changed

  const colleague = await view(hr2, id);
  assert.equal(colleague.canDecide, true);
  assert.equal(colleague.blockedReason, null);
  assert.equal((await decide(hr2, id)).body.data.leave.status, "Approved");
});

test("nobody can approve their own leave, whoever entered it", async () => {
  const forHana = await createLeave(hr2, ids.hana); // entered by a colleague
  const id = forHana.body.data.leave.id;

  const own = await view(hr1, id);
  assert.equal(own.canDecide, false);
  assert.match(own.blockedReason, /your own leave/i);
  const refused = await decide(hr1, id);
  assert.equal(refused.status, 403);
  assert.match(refused.body.message, /your own leave/i);

  // the colleague who entered it is blocked too; the Admin (not the creator, not the owner) can decide
  assert.equal((await decide(hr2, id)).status, 403);
  assert.equal((await decide(admin, id, "Rejected")).body.data.leave.status, "Rejected");
});

test("an Admin may approve requests they entered, but never their own leave", async () => {
  const forPriya = await createLeave(admin, ids.priya);
  const priyaId = forPriya.body.data.leave.id;
  assert.equal((await view(admin, priyaId)).canDecide, true);
  assert.equal((await decide(admin, priyaId)).body.data.leave.status, "Approved");

  const forOwner = await createLeave(admin, ids.owner);
  const ownerId = forOwner.body.data.leave.id;
  assert.equal((await view(admin, ownerId)).canDecide, false);
  assert.equal((await decide(admin, ownerId)).status, 403);
  assert.equal((await decide(hr1, ownerId)).body.data.leave.status, "Approved"); // someone else can
});

test("decided requests offer nothing, and unknown ids are still not found", async () => {
  const made = await createLeave(hr1, ids.priya);
  const id = made.body.data.leave.id;
  await decide(hr2, id, "Rejected");

  const settled = await view(hr2, id);
  assert.equal(settled.canDecide, false);
  assert.equal(settled.blockedReason, null);
  assert.equal((await decide(admin, id)).status, 409); // already decided

  assert.equal((await decide(admin, "000000000000000000000000")).status, 404);
});

test("the rule applies to the self-service flow too", async () => {
  // Hana asks for her own leave through My Profile; she still cannot approve it herself
  const own = await call("/me/leave", { method: "POST", token: hr1, body: nextDates() });
  assert.equal(own.status, 201);
  const id = own.body.data.leave.id;

  assert.equal((await decide(hr1, id)).status, 403);
  assert.equal((await decide(hr2, id)).body.data.leave.status, "Approved");
});
