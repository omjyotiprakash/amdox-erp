process.env.AUTH_RATE_LIMIT = "1000";
process.env.BCRYPT_ROUNDS = "4";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const app = require("../src/app");
const Role = require("../src/models/Role");
const Transaction = require("../src/models/finance/Transaction");
const Employee = require("../src/models/hr/Employee");
const { parsePaging, pageInfo } = require("../src/utils/pagination");

let server;
let mongo;
let base;
let token;

const call = async (path) => {
  const res = await fetch(base + path, { headers: { Authorization: `Bearer ${token}` } });
  return { status: res.status, body: await res.json() };
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Admin", email: "admin@example.com", password: "supersecret1" }),
  });
  token = (await res.json()).data.token;

  // 120 ledger rows (so 3 pages at the default 50) and 7 employees
  await Transaction.insertMany(
    Array.from({ length: 120 }, (_, i) => ({
      code: `TXN-${2000 + i}`,
      date: new Date(Date.UTC(2026, 0, 1 + (i % 28))),
      description: i % 2 ? `Sale ${i}` : `Rent ${i}`,
      account: "General",
      type: i % 2 ? "Income" : "Expense",
      amount: 10,
      status: "Posted",
    }))
  );
  await Employee.insertMany(
    Array.from({ length: 7 }, (_, i) => ({
      code: `EMP-${3000 + i}`,
      name: `Person ${i}`,
      email: `p${i}@amdox.com`,
      department: "Eng",
      jobTitle: "Dev",
      joinedOn: new Date("2025-01-01"),
    }))
  );
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("parsePaging clamps bad input to safe values", () => {
  assert.deepEqual(parsePaging({}), { page: 1, limit: 50, skip: 0 });
  assert.deepEqual(parsePaging({ page: "3", limit: "20" }), { page: 3, limit: 20, skip: 40 });
  assert.equal(parsePaging({ limit: "99999" }).limit, 200);
  assert.equal(parsePaging({ limit: "0" }).limit, 50);
  assert.equal(parsePaging({ limit: "-5" }).limit, 1);
  assert.equal(parsePaging({ page: "-2" }).page, 1);
  assert.equal(parsePaging({ page: "abc", limit: "abc" }).page, 1);
  assert.deepEqual(pageInfo({ page: 1, limit: 50 }, 0), { page: 1, limit: 50, matching: 0, pages: 1 });
  assert.equal(pageInfo({ page: 1, limit: 50 }, 101).pages, 3);
});

test("ledger is paged: pages, no overlap, totals unaffected", async () => {
  const first = (await call("/finance/ledger")).body.data;
  assert.equal(first.items.length, 50);
  assert.deepEqual([first.page, first.pages, first.matching, first.total], [1, 3, 120, 120]);
  assert.equal(first.summary.income, 600); // summary covers every row, not just this page

  const second = (await call("/finance/ledger?page=2")).body.data;
  const third = (await call("/finance/ledger?page=3")).body.data;
  assert.equal(second.items.length, 50);
  assert.equal(third.items.length, 20);
  const codes = [...first.items, ...second.items, ...third.items].map((item) => item.code);
  assert.equal(new Set(codes).size, 120); // every row appears exactly once

  assert.equal((await call("/finance/ledger?page=4")).body.data.items.length, 0); // past the end
  assert.equal((await call("/finance/ledger?limit=100")).body.data.items.length, 100);
  assert.equal((await call("/finance/ledger?limit=100")).body.data.pages, 2);
});

test("matching reflects filters while total stays overall", async () => {
  const income = (await call("/finance/ledger?type=Income")).body.data;
  assert.deepEqual([income.matching, income.total, income.pages], [60, 120, 2]);
  assert.equal(income.items.length, 50);

  const searched = (await call("/finance/ledger?search=Rent&limit=10")).body.data;
  assert.deepEqual([searched.matching, searched.pages, searched.items.length], [60, 6, 10]);

  const none = (await call("/finance/ledger?search=zzzz")).body.data;
  assert.deepEqual([none.matching, none.pages, none.items.length, none.total], [0, 1, 0, 120]);
});

test("other lists are paged too", async () => {
  const employees = (await call("/hr/employees?limit=3&page=3")).body.data;
  assert.deepEqual([employees.items.length, employees.matching, employees.pages, employees.page], [1, 7, 3, 3]);
  assert.equal(employees.items[0].code, "EMP-3006");
  assert.equal(employees.summary.total, 7); // summary is global

  for (const path of ["/finance/payables", "/finance/receivables", "/hr/leave", "/supply-chain/inventory", "/supply-chain/vendors", "/supply-chain/purchase-orders", "/projects"]) {
    const data = (await call(`${path}?limit=5`)).body.data;
    assert.deepEqual([data.page, data.pages, data.matching, data.limit], [1, 1, 0, 5], path);
  }
});
