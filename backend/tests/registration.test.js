// Deliberately does NOT enable public registration: this is the production default.
process.env.AUTH_RATE_LIMIT = "1000";
process.env.BCRYPT_ROUNDS = "4";
delete process.env.ALLOW_PUBLIC_REGISTRATION;

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const app = require("../src/app");
const Role = require("../src/models/Role");

let server;
let mongo;
let base;

const call = async (path, { method = "GET", body, token } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};
const signUp = (email) =>
  call("/auth/register", { method: "POST", body: { name: "Person", email, password: "supersecret1" } });

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("sign-up is open only until the first Admin exists", async () => {
  assert.equal((await call("/auth/registration")).body.data.open, true);

  const first = await signUp("owner@example.com");
  assert.equal(first.status, 201);
  assert.equal(first.body.data.user.role.name, "Admin");

  assert.equal((await call("/auth/registration")).body.data.open, false);
  const second = await signUp("stranger@example.com");
  assert.equal(second.status, 403);
  assert.match(second.body.message, /sign-up is closed/i);
});

test("a closed sign-up reveals nothing about existing accounts", async () => {
  const existing = await signUp("owner@example.com"); // already registered
  const unknown = await signUp("someone-new@example.com");
  assert.equal(existing.status, 403);
  assert.equal(unknown.status, 403);
  assert.equal(existing.body.message, unknown.body.message);
});

test("admins can still create accounts, and those users can log in", async () => {
  const login = await call("/auth/login", { method: "POST", body: { email: "owner@example.com", password: "supersecret1" } });
  const token = login.body.data.token;
  const roles = await call("/settings/roles", { token });
  const employeeRole = roles.body.data.items.find((role) => role.name === "Employee").id;

  const created = await call("/settings/users", {
    method: "POST",
    token,
    body: { name: "Staff", email: "staff@example.com", password: "staffpass123", roleId: employeeRole },
  });
  assert.equal(created.status, 201);

  const staff = await call("/auth/login", { method: "POST", body: { email: "staff@example.com", password: "staffpass123" } });
  assert.equal(staff.status, 200);
});
