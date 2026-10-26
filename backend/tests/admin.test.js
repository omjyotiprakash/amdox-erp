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
let employeeToken; // built-in Employee role
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

const login = async (email, password) =>
  (await call("/auth/login", { method: "POST", token: null, body: { email, password } })).body.data?.token;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  await Role.ensureDefaults();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  const register = async (name, email) => {
    const res = await call("/auth/register", { method: "POST", token: null, body: { name, email, password: "supersecret1" } });
    return res.body.data;
  };
  const admin = await register("Admin", "admin@example.com");
  adminToken = admin.token;
  ids.admin = admin.user.id;
  const employee = await register("Emp", "emp@example.com");
  employeeToken = employee.token;
  ids.employee = employee.user.id;
});

after(async () => {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
});

test("settings endpoints are admin-only", async () => {
  for (const path of ["/settings/general", "/settings/integrations", "/settings/roles", "/settings/users"]) {
    assert.equal((await call(path, { token: null })).status, 401, path);
    assert.equal((await call(path, { token: employeeToken })).status, 403, path);
    assert.equal((await call(path)).status, 200, path);
  }
});

test("general settings: defaults, partial update, validation", async () => {
  const initial = (await call("/settings/general")).body.data.settings;
  assert.equal(initial.companyName, "AMDox ERP");
  assert.equal(initial.currency, "INR");
  assert.equal(initial.lowStockAlerts, true);

  const saved = await call("/settings/general", {
    method: "PUT",
    body: { companyName: "Acme Corp", currency: "USD", weeklyReports: true, email: "Info@Acme.com", website: "https://acme.com" },
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.data.settings.companyName, "Acme Corp");
  assert.equal(saved.body.data.settings.email, "info@acme.com");
  assert.equal(saved.body.data.settings.timezone, "Asia/Kolkata"); // untouched

  const reread = (await call("/settings/general")).body.data.settings;
  assert.deepEqual([reread.companyName, reread.currency, reread.weeklyReports], ["Acme Corp", "USD", true]);

  for (const bad of [{ currency: "XYZ" }, { email: "nope" }, { companyName: "  " }, { website: "acme.com" }, { weeklyReports: "yes" }]) {
    assert.equal((await call("/settings/general", { method: "PUT", body: bad })).status, 400, JSON.stringify(bad));
  }
  assert.equal((await call("/settings/general", { method: "PUT", token: employeeToken, body: { companyName: "Hacked" } })).status, 403);
});

test("integrations: list, enable and disable, protected database entry", async () => {
  let items = (await call("/settings/integrations")).body.data.items;
  assert.equal(items.length, 6);
  assert.equal(items.find((i) => i.key === "mongodb").enabled, true);
  assert.equal(items.find((i) => i.key === "stripe").enabled, false);

  const enabled = await call("/settings/integrations/stripe", { method: "PUT", body: { enabled: true } });
  assert.equal(enabled.body.data.integration.enabled, true);
  items = (await call("/settings/integrations")).body.data.items;
  assert.equal(items.find((i) => i.key === "stripe").enabled, true); // persisted
  assert.equal(items.filter((i) => i.enabled).length, 2);

  await call("/settings/integrations/stripe", { method: "PUT", body: { enabled: false } });
  assert.equal((await call("/settings/integrations")).body.data.items.find((i) => i.key === "stripe").enabled, false);

  assert.equal((await call("/settings/integrations/mongodb", { method: "PUT", body: { enabled: false } })).status, 400);
  assert.equal((await call("/settings/integrations/nope", { method: "PUT", body: { enabled: true } })).status, 404);
  assert.equal((await call("/settings/integrations/slack", { method: "PUT", body: { enabled: "yes" } })).status, 400);
});

test("roles: list, create, duplicate, admin is locked", async () => {
  const list = (await call("/settings/roles")).body.data;
  assert.deepEqual(list.items.map((r) => [r.name, r.users]), [["Admin", 1], ["Manager", 0], ["Employee", 1]]);
  assert.equal(list.summary.assignedUsers, 2);
  assert.equal(list.modules.length, 7);
  const adminRole = list.items.find((r) => r.name === "Admin");
  ids.adminRole = adminRole.id;
  ids.employeeRole = list.items.find((r) => r.name === "Employee").id;
  assert.equal(adminRole.permissions.settings.delete, true);

  const created = await call("/settings/roles", { method: "POST", body: { name: "Finance Clerk", description: "Ledger access" } });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.role.permissions.finance.view, false); // nothing granted by default
  ids.clerkRole = created.body.data.role.id;

  assert.equal((await call("/settings/roles", { method: "POST", body: { name: "Finance Clerk" } })).status, 409);
  assert.equal((await call("/settings/roles", { method: "POST", body: { name: "" } })).status, 400);
  assert.equal((await call(`/settings/roles/${ids.adminRole}/permissions`, { method: "PUT", body: { permissions: { finance: { view: false } } } })).status, 400);
  assert.equal((await call("/settings/roles?search=clerk")).body.data.items.length, 1);
});

test("role permission changes are enforced by the server", async () => {
  const user = await call("/settings/users", {
    method: "POST",
    body: { name: "Clara Clerk", email: "Clara@Example.com", password: "clerkpass1", roleId: ids.clerkRole },
  });
  assert.equal(user.status, 201);
  assert.equal(user.body.data.user.email, "clara@example.com");
  assert.equal(user.body.data.user.passwordHash, undefined);
  assert.equal(user.body.data.user.role.name, "Finance Clerk");
  ids.clara = user.body.data.user.id;

  const clara = await login("clara@example.com", "clerkpass1");
  assert.ok(clara, "new user can sign in with the password the admin set");
  assert.equal((await call("/finance/ledger", { token: clara })).status, 403); // no access yet

  const granted = await call(`/settings/roles/${ids.clerkRole}/permissions`, {
    method: "PUT",
    body: { permissions: { finance: { view: true, create: true } } },
  });
  assert.equal(granted.status, 200);
  assert.equal(granted.body.data.role.permissions.finance.create, true);
  assert.equal(granted.body.data.role.permissions.finance.delete, false);
  assert.equal(granted.body.data.role.users, 1);

  // same token, new permissions: the role is read on every request
  assert.equal((await call("/finance/ledger", { token: clara })).status, 200);
  const entry = { date: isoDate(0), description: "Test", account: "Sales", type: "Income", amount: 100 };
  assert.equal((await call("/finance/ledger", { method: "POST", token: clara, body: entry })).status, 201);
  assert.equal((await call("/hr/employees", { token: clara })).status, 403); // still no HR
  const txId = (await call("/finance/ledger")).body.data.items[0].id;
  assert.equal((await call(`/finance/ledger/${txId}`, { method: "DELETE", token: clara })).status, 403); // no delete right
  await call(`/finance/ledger/${txId}`, { method: "DELETE" }); // admin cleans up

  // revoking takes effect immediately too
  await call(`/settings/roles/${ids.clerkRole}/permissions`, { method: "PUT", body: { permissions: { finance: { view: false, create: false } } } });
  assert.equal((await call("/finance/ledger", { token: clara })).status, 403);
});

test("users: list, filters, update, deactivate, reset password", async () => {
  const list = (await call("/settings/users")).body.data;
  assert.deepEqual(list.summary, { total: 3, active: 3, inactive: 0, admins: 1 });
  assert.equal(list.roles.length, 4);
  assert.equal((await call(`/settings/users?roleId=${ids.clerkRole}`)).body.data.items.length, 1);
  assert.equal((await call("/settings/users?search=clara")).body.data.items.length, 1);

  assert.equal((await call("/settings/users", { method: "POST", body: { name: "X", email: "clara@example.com", password: "longenough1", roleId: ids.clerkRole } })).status, 409);
  assert.equal((await call("/settings/users", { method: "POST", body: { name: "X", email: "x@example.com", password: "short", roleId: ids.clerkRole } })).status, 400);
  assert.equal((await call("/settings/users", { method: "POST", body: { name: "X", email: "x@example.com", password: "longenough1", roleId: "000000000000000000000000" } })).status, 404);

  const renamed = await call(`/settings/users/${ids.clara}`, { method: "PUT", body: { name: "Clara C", roleId: ids.employeeRole } });
  assert.equal(renamed.body.data.user.name, "Clara C");
  assert.equal(renamed.body.data.user.role.name, "Employee");

  const reset = await call(`/settings/users/${ids.clara}`, { method: "PUT", body: { password: "brandnewpass1" } });
  assert.equal(reset.status, 200);
  assert.equal(await login("clara@example.com", "clerkpass1"), undefined); // old password dead
  const claraToken = await login("clara@example.com", "brandnewpass1");
  assert.ok(claraToken);

  await call(`/settings/users/${ids.clara}`, { method: "PUT", body: { status: "inactive" } });
  assert.equal((await call("/auth/me", { token: claraToken })).status, 401); // existing token stops working
  assert.equal(await login("clara@example.com", "brandnewpass1"), undefined); // and so does login
  assert.deepEqual((await call("/settings/users")).body.data.summary, { total: 3, active: 2, inactive: 1, admins: 1 });
  assert.equal((await call("/settings/users?status=inactive")).body.data.items.length, 1);

  await call(`/settings/users/${ids.clara}`, { method: "PUT", body: { status: "active" } });
  assert.ok(await login("clara@example.com", "brandnewpass1"));
  assert.equal((await call("/settings/users/000000000000000000000000", { method: "PUT", body: { name: "Ghost" } })).status, 404);
});

test("users: cannot lock yourself out or remove the last Admin", async () => {
  assert.equal((await call(`/settings/users/${ids.admin}`, { method: "PUT", body: { status: "inactive" } })).status, 400); // self
  assert.equal((await call(`/settings/users/${ids.admin}`, { method: "PUT", body: { roleId: ids.employeeRole } })).status, 400); // self

  // a delegate who can manage users, but is not an Admin
  const role = await call("/settings/roles", { method: "POST", body: { name: "User Manager" } });
  await call(`/settings/roles/${role.body.data.role.id}/permissions`, {
    method: "PUT",
    body: { permissions: { settings: { view: true, edit: true } } },
  });
  await call("/settings/users", {
    method: "POST",
    body: { name: "Delegate", email: "delegate@example.com", password: "delegatepass1", roleId: role.body.data.role.id },
  });
  const delegate = await login("delegate@example.com", "delegatepass1");

  assert.equal((await call(`/settings/users/${ids.admin}`, { method: "PUT", token: delegate, body: { status: "inactive" } })).status, 409);
  assert.equal((await call(`/settings/users/${ids.admin}`, { method: "PUT", token: delegate, body: { roleId: ids.employeeRole } })).status, 409);

  // with a second Admin in place the first can be demoted
  const second = await call("/settings/users", {
    method: "POST",
    body: { name: "Admin Two", email: "admin2@example.com", password: "adminpass22", roleId: ids.adminRole },
  });
  assert.equal((await call(`/settings/users/${ids.admin}`, { method: "PUT", token: delegate, body: { roleId: ids.employeeRole } })).status, 200);
  // ...but now the second one is the last
  assert.equal((await call(`/settings/users/${second.body.data.user.id}`, { method: "PUT", token: delegate, body: { status: "inactive" } })).status, 409);
});

test("role deletion rules", async () => {
  assert.equal((await call(`/settings/roles/${ids.employeeRole}`, { method: "DELETE", token: await login("admin2@example.com", "adminpass22") })).status, 400); // built-in
  assert.equal((await call(`/settings/roles/${ids.clerkRole}`, { method: "DELETE", token: await login("admin2@example.com", "adminpass22") })).status, 200); // custom, unused
  assert.equal((await call("/settings/roles/000000000000000000000000", { method: "DELETE", token: await login("admin2@example.com", "adminpass22") })).status, 404);
});

test("dashboard: numbers come from real data and respect permissions", async () => {
  const admin = await login("admin2@example.com", "adminpass22"); // the original admin was demoted above
  const post = (path, body) => call(path, { method: "POST", token: admin, body });

  await post("/finance/ledger", { date: isoDate(0), description: "Sale", account: "Sales", type: "Income", amount: 5000 });
  await post("/finance/ledger", { date: isoDate(0), description: "Rent", account: "Rent", type: "Expense", amount: 1200 });
  await post("/finance/ledger", { date: isoDate(0), description: "Later", account: "Sales", type: "Income", amount: 999, status: "Pending" });
  await post("/finance/payables", { party: "Late Vendor", invoiceNumber: "A-1", dueDate: isoDate(-5), amount: 300 });
  await post("/hr/employees", { name: "Eve", email: "eve@amdox.com", department: "Eng", jobTitle: "Dev", joinedOn: "2025-01-01" });
  const eve = (await call("/hr/employees", { token: admin })).body.data.items[0];
  await post("/hr/leave", { employeeId: eve.id, type: "Sick Leave", from: isoDate(3), to: isoDate(4) });
  await post("/supply-chain/inventory", { name: "Mouse", category: "Acc", sku: "M-1", quantity: 0, price: 800, reorderLevel: 5 });
  await post("/supply-chain/inventory", { name: "Chair", category: "Furn", sku: "C-1", quantity: 3, price: 5500, reorderLevel: 5 });
  const vendor = await post("/supply-chain/vendors", { name: "V", category: "x", contact: "c", email: "v@v.com", phone: "1", location: "l", status: "Active" });
  await post("/supply-chain/purchase-orders", { vendorId: vendor.body.data.vendor.id, orderDate: isoDate(0), deliveryDate: isoDate(5), items: 1, amount: 100 });
  await post("/projects", { name: "Late One", startDate: "2026-01-01", dueDate: isoDate(-10), status: "In Progress", budget: 1000, spent: 1500 });
  await post("/projects", { name: "Fine One", startDate: "2026-01-01", dueDate: isoDate(60), status: "Completed" });

  const data = (await call("/dashboard/summary", { token: admin })).body.data;
  assert.equal(data.modules.length, 7);
  assert.deepEqual(data.finance, { income: 5000, expenses: 1200, net: 3800, overduePayables: 1, overdueReceivables: 0 });
  assert.deepEqual(data.hr, { employees: 1, active: 1, onLeave: 0, pendingLeave: 1 });
  assert.deepEqual(data.supplyChain, { products: 2, outOfStock: 1, lowStock: 1, pendingOrders: 1 });
  assert.deepEqual(data.projects, { total: 2, active: 1, completed: 1 });

  const limited = (await call("/dashboard/summary", { token: employeeToken })).body.data;
  assert.deepEqual(limited.modules.sort(), ["dashboard", "projects", "supplyChain"]);
  assert.equal(limited.finance, undefined);
  assert.equal(limited.hr, undefined);
  assert.equal(limited.projects.total, 2);
  assert.equal((await call("/dashboard/summary", { token: null })).status, 401);
});

test("notifications: derived from live data, permission-aware, honours settings", async () => {
  const admin = await login("admin2@example.com", "adminpass22");
  const ids_ = async (token) => (await call("/notifications", { token })).body.data.items.map((i) => i.id);

  const all = await ids_(admin);
  for (const id of ["overdue-payables", "pending-leave", "pending-orders", "out-of-stock", "low-stock", "late-projects", "over-budget"]) {
    assert.ok(all.includes(id), `missing ${id}`);
  }
  const first = (await call("/notifications", { token: admin })).body.data;
  assert.equal(first.count, first.items.length);
  assert.equal(first.items[0].level, "danger"); // most urgent first
  assert.equal(first.items.find((i) => i.id === "overdue-payables").title, "1 vendor invoice is overdue");
  assert.equal(first.items.find((i) => i.id === "pending-leave").link, "/hr/leave");

  // Employee role: projects + supply chain only, no finance or HR alerts
  const limited = await ids_(employeeToken);
  assert.ok(limited.includes("late-projects"));
  assert.ok(limited.includes("low-stock"));
  assert.ok(!limited.includes("overdue-payables"));
  assert.ok(!limited.includes("pending-leave"));

  // switching low-stock alerts off removes the stock notifications
  await call("/settings/general", { method: "PUT", token: admin, body: { lowStockAlerts: false } });
  const quiet = await ids_(admin);
  assert.ok(!quiet.includes("low-stock") && !quiet.includes("out-of-stock"));
  assert.ok(quiet.includes("overdue-payables"));

  assert.equal((await call("/notifications", { token: null })).status, 401);
});
