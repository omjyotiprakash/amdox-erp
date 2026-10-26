process.env.AUTH_RATE_LIMIT = "1000";
process.env.BCRYPT_ROUNDS = "4";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const app = require("../src/app");
const Role = require("../src/models/Role");
const AuditLog = require("../src/models/AuditLog");

let server;
let mongo;
let base;
let adminToken;
let employeeToken;
let employeeId;

const call = async (path, { method = "GET", body, token = adminToken } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const login = async (email, password) =>
  (await call("/auth/login", { method: "POST", token: null, body: { email, password } })).body.data?.token;

// Audit rows are written just after the response is sent.
const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  const register = async (name, email) =>
    (await call("/auth/register", { method: "POST", token: null, body: { name, email, password: "supersecret1" } })).body.data;
  adminToken = (await register("Admin", "admin@example.com")).token;
  const employee = await register("Emp", "emp@example.com");
  employeeToken = employee.token;
  employeeId = employee.user.id;
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("change password: validation and success", async () => {
  const change = (body, token = employeeToken) => call("/auth/change-password", { method: "POST", token, body });

  assert.equal((await change({ currentPassword: "wrong-password", newPassword: "brandnewpass1" })).status, 400);
  assert.equal((await change({ currentPassword: "supersecret1", newPassword: "supersecret1" })).status, 400);
  assert.equal((await change({ currentPassword: "supersecret1", newPassword: "short" })).status, 400);
  assert.equal((await change({ currentPassword: "supersecret1" })).status, 400);
  assert.equal((await change({ currentPassword: "supersecret1", newPassword: "brandnewpass1" }, null)).status, 401);

  const sessionBefore = await login("emp@example.com", "supersecret1"); // a second device
  const changed = await change({ currentPassword: "supersecret1", newPassword: "brandnewpass1" });
  assert.equal(changed.status, 200);
  assert.ok(changed.body.data.token);
  assert.equal(changed.body.data.user.passwordHash, undefined);
  assert.equal(changed.body.data.user.tokenVersion, undefined);

  // every older session ends, the fresh token works
  assert.equal((await call("/auth/me", { token: employeeToken })).status, 401);
  assert.equal((await call("/auth/me", { token: sessionBefore })).status, 401);
  employeeToken = changed.body.data.token;
  assert.equal((await call("/auth/me", { token: employeeToken })).status, 200);

  assert.equal(await login("emp@example.com", "supersecret1"), undefined);
  assert.ok(await login("emp@example.com", "brandnewpass1"));
});

test("an admin password reset also ends that user's sessions", async () => {
  const session = await login("emp@example.com", "brandnewpass1");
  assert.equal((await call("/auth/me", { token: session })).status, 200);

  const reset = await call(`/settings/users/${employeeId}`, { method: "PUT", body: { password: "resetbyadmin1" } });
  assert.equal(reset.status, 200);

  assert.equal((await call("/auth/me", { token: session })).status, 401);
  assert.equal(await login("emp@example.com", "brandnewpass1"), undefined);
  employeeToken = await login("emp@example.com", "resetbyadmin1");
  assert.ok(employeeToken);
});

test("audit log records successful changes only, without request bodies", async () => {
  await AuditLog.deleteMany({});

  const entry = { date: "2026-10-01", description: "Secret sale", account: "Sales", type: "Income", amount: 1234 };
  const created = await call("/finance/ledger", { method: "POST", body: entry });
  const id = created.body.data.transaction.id;
  await call(`/finance/ledger/${id}`, { method: "PUT", body: { amount: 99 } });
  await call("/finance/ledger", { method: "GET" }); // reads are not logged
  await call("/finance/ledger", { method: "POST", body: { description: "" } }); // 400, not logged
  await call("/finance/ledger", { method: "POST", token: employeeToken, body: entry }); // 403, not logged
  await call("/auth/login", { method: "POST", token: null, body: { email: "admin@example.com", password: "supersecret1" } }); // no user yet
  await call("/auth/change-password", { method: "POST", token: adminToken, body: { currentPassword: "supersecret1", newPassword: "adminnewpass1" } });
  adminToken = await login("admin@example.com", "adminnewpass1");
  await call(`/finance/ledger/${id}`, { method: "DELETE" });
  await settle();

  const rows = await AuditLog.find().sort({ createdAt: 1 });
  assert.deepEqual(
    rows.map((row) => [row.action, row.resource]),
    [["create", "finance/ledger"], ["update", "finance/ledger"], ["create", "auth/change-password"], ["delete", "finance/ledger"]]
  );
  assert.equal(rows[0].userName, "Admin");
  assert.equal(rows[1].target, id);
  assert.equal(rows[0].target, "");

  const stored = JSON.stringify(rows);
  for (const secret of ["Secret sale", "1234", "supersecret1", "adminnewpass1"]) {
    assert.ok(!stored.includes(secret), `audit log must not contain "${secret}"`);
  }
});

test("audit log endpoint: admin only, filters, pagination", async () => {
  assert.equal((await call("/settings/audit", { token: null })).status, 401);
  assert.equal((await call("/settings/audit", { token: employeeToken })).status, 403);

  const all = (await call("/settings/audit")).body.data;
  assert.ok(all.matching >= 4);
  assert.equal(all.items[0].createdAt >= all.items[1].createdAt, true); // newest first
  assert.equal(all.items[0].passwordHash, undefined);

  const deletes = (await call("/settings/audit?action=delete")).body.data;
  assert.ok(deletes.items.length >= 1 && deletes.items.every((row) => row.action === "delete"));
  assert.ok((await call("/settings/audit?search=admin")).body.data.items.length >= 1);
  assert.equal((await call("/settings/audit?search=zzzz")).body.data.items.length, 0);

  const paged = (await call("/settings/audit?limit=2&page=2")).body.data;
  assert.equal(paged.page, 2);
  assert.equal(paged.limit, 2);
  assert.ok(paged.items.length <= 2);
});
