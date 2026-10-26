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

const call = async (path, { method = "GET", body, token = adminToken } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const isoDate = (offsetDays) => {
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

  // First account becomes Admin, second is a least-privilege Employee.
  const admin = await call("/auth/register", {
    method: "POST",
    token: null,
    body: { name: "Admin", email: "admin@example.com", password: "supersecret1" },
  });
  adminToken = admin.body.data.token;
  const employee = await call("/auth/register", {
    method: "POST",
    token: null,
    body: { name: "Emp", email: "emp@example.com", password: "supersecret2" },
  });
  employeeToken = employee.body.data.token;
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("finance endpoints require login and finance permission", async () => {
  assert.equal((await call("/finance/ledger", { token: null })).status, 401);
  assert.equal((await call("/finance/ledger", { token: employeeToken })).status, 403);
  assert.equal((await call("/finance/payables", { token: employeeToken })).status, 403);
  assert.equal((await call("/finance/reports/summary", { token: employeeToken })).status, 403);
});

test("ledger: create, list, filter, summary counts Posted only", async () => {
  const entries = [
    { date: isoDate(-1), description: "Product sales", account: "Sales Revenue", type: "Income", amount: 1000 },
    { date: isoDate(-2), description: "Office rent", account: "Rent Expense", type: "Expense", amount: 400.555 },
    { date: isoDate(-3), description: "Pending sale", account: "Sales Revenue", type: "Income", amount: 999, status: "Pending" },
  ];
  const codes = [];
  for (const entry of entries) {
    const res = await call("/finance/ledger", { method: "POST", body: entry });
    assert.equal(res.status, 201);
    codes.push(res.body.data.transaction.code);
  }
  assert.deepEqual(codes, ["TXN-1001", "TXN-1002", "TXN-1003"]);

  const all = await call("/finance/ledger");
  assert.equal(all.body.data.items.length, 3);
  assert.equal(all.body.data.items[0].description, "Product sales"); // newest first
  assert.equal(all.body.data.items[0].date, isoDate(-1));
  assert.equal(all.body.data.summary.income, 1000); // Pending excluded
  assert.equal(all.body.data.summary.expenses, 400.56); // rounded to 2 dp
  assert.equal(all.body.data.summary.net, 599.44);

  const expenses = await call("/finance/ledger?type=Expense");
  assert.equal(expenses.body.data.items.length, 1);
  assert.equal(expenses.body.data.summary.income, 1000); // summary not affected by filters

  const searched = await call("/finance/ledger?search=rent");
  assert.equal(searched.body.data.items[0].account, "Rent Expense");
  // regex characters in search must be treated literally, not crash
  assert.equal((await call("/finance/ledger?search=(%5B")).status, 200);
});

test("ledger: validation, update keeps untouched fields, delete", async () => {
  const bad = await call("/finance/ledger", {
    method: "POST",
    body: { date: "2026-02-31", description: "", account: "x", type: "Other", amount: -5 },
  });
  assert.equal(bad.status, 400);

  const created = await call("/finance/ledger", {
    method: "POST",
    body: { date: isoDate(0), description: "Temp", account: "Misc", type: "Expense", amount: 10, status: "Pending" },
  });
  const id = created.body.data.transaction.id;

  const updated = await call(`/finance/ledger/${id}`, { method: "PUT", body: { amount: 20 } });
  assert.equal(updated.body.data.transaction.amount, 20);
  assert.equal(updated.body.data.transaction.status, "Pending"); // not reset by the update

  assert.equal((await call(`/finance/ledger/${id}`, { method: "DELETE" })).status, 200);
  assert.equal((await call(`/finance/ledger/${id}`, { method: "DELETE" })).status, 404);
  assert.equal((await call("/finance/ledger/not-an-id", { method: "DELETE" })).status, 400);
});

test("payables: overdue is derived, mark paid, summary, duplicates", async () => {
  const make = (party, invoiceNumber, dueDate, amount) =>
    call("/finance/payables", { method: "POST", body: { party, invoiceNumber, dueDate, amount } });

  const future = await make("Tech Solutions", "INV-1", isoDate(10), 500);
  const late = await make("Cloud Services", "INV-2", isoDate(-5), 300);
  assert.equal(future.body.data.invoice.code, "AP-1001");
  assert.equal(future.body.data.invoice.status, "Pending");
  assert.equal(late.body.data.invoice.status, "Overdue");

  assert.equal((await make("Tech Solutions", "INV-1", isoDate(10), 500)).status, 409);

  const overdueOnly = await call("/finance/payables?status=Overdue");
  assert.deepEqual(overdueOnly.body.data.items.map((i) => i.invoiceNumber), ["INV-2"]);
  const pendingOnly = await call("/finance/payables?status=Pending");
  assert.deepEqual(pendingOnly.body.data.items.map((i) => i.invoiceNumber), ["INV-1"]);

  let { summary } = (await call("/finance/payables")).body.data;
  assert.deepEqual(summary, { outstanding: 800, paid: 0, overdueCount: 1 });

  const paid = await call(`/finance/payables/${late.body.data.invoice.id}/pay`, { method: "PATCH" });
  assert.equal(paid.body.data.invoice.status, "Paid");
  assert.equal((await call(`/finance/payables/${late.body.data.invoice.id}/pay`, { method: "PATCH" })).status, 409);

  ({ summary } = (await call("/finance/payables")).body.data);
  assert.deepEqual(summary, { outstanding: 500, paid: 300, overdueCount: 0 });
});

test("receivables are separate from payables", async () => {
  const created = await call("/finance/receivables", {
    method: "POST",
    body: { party: "Acme", invoiceNumber: "INV-1", dueDate: isoDate(3), amount: 900 },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.invoice.code, "AR-1001");

  const ar = await call("/finance/receivables");
  assert.equal(ar.body.data.items.length, 1);
  const ap = await call("/finance/payables");
  assert.equal(ap.body.data.items.length, 2);

  // a payable id cannot be paid or deleted through the receivables endpoints
  const apId = ap.body.data.items[0].id;
  assert.equal((await call(`/finance/receivables/${apId}/pay`, { method: "PATCH" })).status, 404);
  assert.equal((await call(`/finance/receivables/${apId}`, { method: "DELETE" })).status, 404);
});

test("reports: monthly totals and transactions for the period", async () => {
  const res = await call("/finance/reports/summary?months=3");
  assert.equal(res.status, 200);
  const { months, totals, transactions } = res.body.data;
  assert.equal(months.length, 3);
  assert.equal(totals.income, months.reduce((s, m) => s + m.income, 0));
  assert.equal(totals.income, 1000);
  assert.equal(totals.expenses, 400.56);
  assert.ok(transactions.length >= 3);

  const twelve = await call("/finance/reports/summary?months=12");
  assert.equal(twelve.body.data.months.length, 12);
  const fallback = await call("/finance/reports/summary?months=99");
  assert.equal(fallback.body.data.months.length, 6);
});
