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

const call = async (path, { method = "GET", body, token } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

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

const admin = { name: "Ada Admin", email: "Ada@Example.com", password: "supersecret1" };
const staff = { name: "Sam Staff", email: "sam@example.com", password: "supersecret2" };
let adminToken;
let staffToken;

test("first registered user becomes Admin, later users become Employee", async () => {
  const a = await call("/auth/register", { method: "POST", body: admin });
  assert.equal(a.status, 201);
  assert.equal(a.body.data.user.role.name, "Admin");
  assert.equal(a.body.data.user.email, "ada@example.com");
  assert.equal(a.body.data.user.passwordHash, undefined);
  adminToken = a.body.data.token;

  const s = await call("/auth/register", { method: "POST", body: staff });
  assert.equal(s.body.data.user.role.name, "Employee");
  staffToken = s.body.data.token;
});

test("rejects duplicate email and invalid input", async () => {
  assert.equal((await call("/auth/register", { method: "POST", body: admin })).status, 409);
  const bad = await call("/auth/register", {
    method: "POST",
    body: { name: "x", email: "nope", password: "short" },
  });
  assert.equal(bad.status, 400);
});

test("login succeeds with correct password, fails otherwise", async () => {
  const ok = await call("/auth/login", { method: "POST", body: { email: admin.email, password: admin.password } });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.token);

  const wrong = await call("/auth/login", { method: "POST", body: { email: admin.email, password: "wrongpass" } });
  assert.equal(wrong.status, 401);
  const unknown = await call("/auth/login", { method: "POST", body: { email: "no@one.com", password: "whatever1" } });
  assert.equal(unknown.status, 401);
  assert.equal(unknown.body.message, wrong.body.message);
});

test("/auth/me requires a valid token", async () => {
  assert.equal((await call("/auth/me")).status, 401);
  assert.equal((await call("/auth/me", { token: "garbage" })).status, 401);
  const me = await call("/auth/me", { token: adminToken });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, "ada@example.com");
});

test("authorize() enforces role permissions on the server", async () => {
  const express = require("express");
  const { authenticate, authorize } = require("../src/middleware/auth.middleware");
  const { errorHandler } = require("../src/middleware/errorHandler.middleware");
  const mini = express();
  mini.get("/settings", authenticate, authorize("settings", "view"), (_req, res) => res.json({ ok: true }));
  mini.use(errorHandler);
  const s = mini.listen(0);
  const url = `http://127.0.0.1:${s.address().port}/settings`;
  try {
    const hdr = (t) => ({ headers: { Authorization: `Bearer ${t}` } });
    assert.equal((await fetch(url, hdr(adminToken))).status, 200);
    assert.equal((await fetch(url, hdr(staffToken))).status, 403);
  } finally {
    s.close();
  }
});

test("unknown routes return JSON 404", async () => {
  const res = await call("/nope");
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
