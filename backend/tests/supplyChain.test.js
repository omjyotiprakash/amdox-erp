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
let employeeToken; // Employee role: can view supply chain, nothing else
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

const product = (overrides = {}) => ({
  name: "Laptop - Dell Latitude",
  category: "Electronics",
  sku: "elec-001",
  quantity: 24,
  price: 65000,
  reorderLevel: 10,
  monthlyDemand: 18,
  demandGrowth: 50,
  ...overrides,
});

const vendor = (overrides = {}) => ({
  name: "TechSource India",
  category: "Electronics",
  contact: "Rahul Sharma",
  email: "Rahul@TechSource.example",
  phone: "+91 98765 43210",
  location: "Bhubaneswar",
  status: "Active",
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

test("supply chain endpoints require login; viewers cannot change data", async () => {
  for (const path of ["inventory", "vendors", "purchase-orders", "forecasting"]) {
    assert.equal((await call(`/supply-chain/${path}`, { token: null })).status, 401, path);
    assert.equal((await call(`/supply-chain/${path}`, { token: employeeToken })).status, 200, path); // view allowed
  }
  assert.equal((await call("/supply-chain/inventory", { method: "POST", token: employeeToken, body: product() })).status, 403);
  assert.equal((await call("/supply-chain/vendors", { method: "POST", token: employeeToken, body: vendor() })).status, 403);
});

test("inventory: create, stock status, filters, duplicate sku, stock update", async () => {
  const a = await call("/supply-chain/inventory", { method: "POST", body: product() });
  assert.equal(a.status, 201);
  assert.equal(a.body.data.product.code, "INV-1001");
  assert.equal(a.body.data.product.sku, "ELEC-001"); // normalised to upper case
  assert.equal(a.body.data.product.stockStatus, "In Stock");
  ids.laptop = a.body.data.product.id;

  const mouse = await call("/supply-chain/inventory", {
    method: "POST",
    body: product({ name: "Wireless Mouse", category: "Accessories", sku: "ACC-001", quantity: 8, price: 800, reorderLevel: 15, monthlyDemand: 20, demandGrowth: 40 }),
  });
  assert.equal(mouse.body.data.product.stockStatus, "Low Stock");
  ids.mouse = mouse.body.data.product.id;

  const keyboard = await call("/supply-chain/inventory", {
    method: "POST",
    body: product({ name: "Keyboard", category: "Accessories", sku: "ACC-002", quantity: 0, price: 2500, reorderLevel: 8, monthlyDemand: 14, demandGrowth: 0 }),
  });
  assert.equal(keyboard.body.data.product.stockStatus, "Out of Stock");
  ids.keyboard = keyboard.body.data.product.id;

  assert.equal((await call("/supply-chain/inventory", { method: "POST", body: product({ sku: "ACC-001" }) })).status, 409);
  assert.equal((await call("/supply-chain/inventory", { method: "POST", body: product({ sku: "X", quantity: 1.5 }) })).status, 400);
  assert.equal((await call("/supply-chain/inventory", { method: "POST", body: product({ sku: "X", price: -1 }) })).status, 400);

  const all = (await call("/supply-chain/inventory")).body.data;
  assert.deepEqual(all.summary, { total: 3, totalUnits: 32, stockValue: 24 * 65000 + 8 * 800, lowStock: 1, outOfStock: 1 });
  assert.deepEqual(all.categories, ["Accessories", "Electronics"]);

  const names = async (query) => (await call(`/supply-chain/inventory?${query}`)).body.data.items.map((i) => i.name);
  assert.deepEqual(await names("stock=Low%20Stock"), ["Wireless Mouse"]);
  assert.deepEqual(await names("stock=Out%20of%20Stock"), ["Keyboard"]);
  assert.deepEqual(await names("stock=In%20Stock"), ["Laptop - Dell Latitude"]);
  assert.deepEqual(await names("category=Accessories&stock=Low%20Stock"), ["Wireless Mouse"]);
  assert.deepEqual(await names("search=acc-002"), ["Keyboard"]);

  const restocked = await call(`/supply-chain/inventory/${ids.mouse}/stock`, { method: "PATCH", body: { quantity: 40 } });
  assert.equal(restocked.body.data.product.stockStatus, "In Stock");
  assert.equal((await call(`/supply-chain/inventory/${ids.mouse}/stock`, { method: "PATCH", body: { quantity: -3 } })).status, 400);
  assert.equal((await call(`/supply-chain/inventory/${ids.mouse}/stock`, { method: "PATCH", body: { quantity: 2.5 } })).status, 400);
  await call(`/supply-chain/inventory/${ids.mouse}/stock`, { method: "PATCH", body: { quantity: 8 } });
});

test("forecasting: rule-based projection from demand and growth", async () => {
  // laptop: 18 x 1.5 = 27/month, stock 24 ; mouse: 20 x 1.4 = 28/month, stock 8 ; keyboard: 14/month, stock 0
  const one = (await call("/supply-chain/forecasting?months=1")).body.data;
  const row = (name) => one.items.find((i) => i.product === name);
  assert.equal(row("Laptop - Dell Latitude").predictedDemand, 27);
  assert.equal(row("Laptop - Dell Latitude").stockShortfall, 3);
  assert.equal(row("Wireless Mouse").stockShortfall, 20);
  assert.equal(row("Keyboard").stockShortfall, 14);
  assert.equal(one.summary.productsToReorder, 3);
  assert.equal(one.summary.forecastedUnits, 27 + 28 + 14);
  assert.equal(one.summary.estimatedValue, 27 * 65000 + 28 * 800 + 14 * 2500);

  const six = (await call("/supply-chain/forecasting?months=6")).body.data;
  assert.equal(six.items.find((i) => i.product === "Wireless Mouse").predictedDemand, 168);
  assert.equal((await call("/supply-chain/forecasting?months=99")).body.data.months, 1); // invalid falls back
  assert.equal((await call("/supply-chain/forecasting?category=Accessories")).body.data.items.length, 2);
  assert.equal((await call("/supply-chain/forecasting?search=mouse")).body.data.items.length, 1);
});

test("vendors: create, duplicate, filters, status update, summary", async () => {
  const a = await call("/supply-chain/vendors", { method: "POST", body: vendor() });
  assert.equal(a.status, 201);
  assert.equal(a.body.data.vendor.code, "VEN-1001");
  assert.equal(a.body.data.vendor.email, "rahul@techsource.example");
  ids.techsource = a.body.data.vendor.id;

  const b = await call("/supply-chain/vendors", { method: "POST", body: vendor({ name: "Office Essentials", category: "Furniture", location: "Cuttack", status: "Pending" }) });
  ids.office = b.body.data.vendor.id;
  const c = await call("/supply-chain/vendors", { method: "POST", body: vendor({ name: "Old Supplier", status: "Inactive" }) });
  ids.old = c.body.data.vendor.id;

  assert.equal((await call("/supply-chain/vendors", { method: "POST", body: vendor() })).status, 409);
  assert.equal((await call("/supply-chain/vendors", { method: "POST", body: vendor({ name: "N", email: "nope" }) })).status, 400);

  const all = (await call("/supply-chain/vendors")).body.data;
  assert.deepEqual(all.summary, { total: 3, active: 1, pending: 1, inactive: 1 });
  assert.equal((await call("/supply-chain/vendors?status=Pending")).body.data.items[0].name, "Office Essentials");
  assert.equal((await call("/supply-chain/vendors?category=Furniture")).body.data.items.length, 1);
  assert.equal((await call("/supply-chain/vendors?search=cuttack")).body.data.items.length, 1);

  const activated = await call(`/supply-chain/vendors/${ids.office}`, { method: "PUT", body: { status: "Active" } });
  assert.equal(activated.body.data.vendor.status, "Active");
  assert.equal(activated.body.data.vendor.name, "Office Essentials"); // untouched
});

test("purchase orders: rules, status flow, filters, summary", async () => {
  const order = (body = {}) =>
    call("/supply-chain/purchase-orders", {
      method: "POST",
      body: { vendorId: ids.techsource, orderDate: isoDate(0), deliveryDate: isoDate(10), items: 12, amount: 185000, ...body },
    });

  const first = await order();
  assert.equal(first.status, 201);
  assert.equal(first.body.data.order.code, "PO-1001");
  assert.equal(first.body.data.order.status, "Pending");
  assert.equal(first.body.data.order.vendor.name, "TechSource India");
  ids.po1 = first.body.data.order.id;

  assert.equal((await order({ vendorId: ids.old })).status, 400); // vendor not Active
  assert.equal((await order({ deliveryDate: isoDate(-3) })).status, 400); // delivery before order
  assert.equal((await order({ items: 0 })).status, 400);
  assert.equal((await order({ vendorId: "000000000000000000000000" })).status, 404);

  const second = await order({ vendorId: ids.office, items: 8, amount: 72000 });
  ids.po2 = second.body.data.order.id;

  const setStatus = (id, status) => call(`/supply-chain/purchase-orders/${id}/status`, { method: "PATCH", body: { status } });
  assert.equal((await setStatus(ids.po1, "Delivered")).status, 409); // cannot skip steps
  assert.equal((await setStatus(ids.po1, "Approved")).body.data.order.status, "Approved");
  assert.equal((await setStatus(ids.po1, "Ordered")).body.data.order.status, "Ordered");
  assert.equal((await setStatus(ids.po1, "Delivered")).body.data.order.status, "Delivered");
  assert.equal((await setStatus(ids.po1, "Cancelled")).status, 409); // delivered is final
  assert.equal((await setStatus(ids.po1, "Pending")).status, 400); // not a valid target
  assert.equal((await setStatus(ids.po2, "Cancelled")).body.data.order.status, "Cancelled");

  const third = await order({ amount: 1000, items: 1 });
  ids.po3 = third.body.data.order.id;

  const all = (await call("/supply-chain/purchase-orders")).body.data;
  assert.deepEqual(all.summary, { total: 3, totalValue: 185000 + 1000, pending: 1, delivered: 1 }); // cancelled excluded
  assert.equal((await call("/supply-chain/purchase-orders?status=Delivered")).body.data.items.length, 1);
  assert.equal((await call(`/supply-chain/purchase-orders?vendorId=${ids.office}`)).body.data.items.length, 1);
  assert.equal((await call("/supply-chain/purchase-orders?search=office")).body.data.items.length, 1); // by vendor name
  assert.equal((await call("/supply-chain/purchase-orders?search=PO-1003")).body.data.items.length, 1); // by code

  assert.equal((await call(`/supply-chain/purchase-orders/${ids.po1}`, { method: "DELETE" })).status, 409); // not pending
  assert.equal((await call(`/supply-chain/purchase-orders/${ids.po3}`, { method: "DELETE" })).status, 200);
});

test("vendor deletion is blocked once it has purchase orders", async () => {
  assert.equal((await call(`/supply-chain/vendors/${ids.techsource}`, { method: "DELETE" })).status, 409);
  assert.equal((await call(`/supply-chain/vendors/${ids.old}`, { method: "DELETE" })).status, 200);
  assert.equal((await call(`/supply-chain/vendors/${ids.old}`, { method: "DELETE" })).status, 404);
  assert.equal((await call(`/supply-chain/inventory/${ids.keyboard}`, { method: "DELETE" })).status, 200);
});
