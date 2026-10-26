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
let employeeToken; // Employee role: can view projects only
const ids = {};

const call = async (path, { method = "GET", body, token = adminToken } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const project = (overrides = {}) => ({
  name: "ERP Platform Development",
  description: "Build the ERP",
  client: "Internal",
  manager: "Rahul Sharma",
  priority: "High",
  startDate: "2026-08-01",
  dueDate: "2026-12-15",
  budget: 850000,
  spent: 425000,
  progress: 55,
  status: "In Progress",
  ...overrides,
});

const newEmployee = (name, email, overrides = {}) => ({
  name,
  email,
  department: "Engineering",
  jobTitle: "Developer",
  joinedOn: "2025-01-01",
  basicSalary: 50000,
  deductions: 1000,
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

test("projects: viewers can read but not change", async () => {
  assert.equal((await call("/projects", { token: null })).status, 401);
  assert.equal((await call("/projects", { token: employeeToken })).status, 200);
  assert.equal((await call("/projects/resources", { token: employeeToken })).status, 200);
  assert.equal((await call("/projects", { method: "POST", token: employeeToken, body: project() })).status, 403);
  assert.equal((await call("/projects/resources/assign", { method: "PUT", token: employeeToken, body: {} })).status, 403);
});

test("projects: create, validate, list, filter, summary, update", async () => {
  const a = await call("/projects", { method: "POST", body: project() });
  assert.equal(a.status, 201);
  assert.equal(a.body.data.project.code, "PRJ-1001");
  assert.equal(a.body.data.project.startDate, "2026-08-01");
  assert.deepEqual(a.body.data.project.milestones, []);
  ids.erp = a.body.data.project.id;

  const b = await call("/projects", { method: "POST", body: project({ name: "Employee Portal", client: "Acme", status: "Completed", progress: 100, budget: 250000, spent: 250000 }) });
  ids.portal = b.body.data.project.id;
  const c = await call("/projects", { method: "POST", body: { name: "Analytics", startDate: "2026-10-15", dueDate: "2027-02-28" } }); // defaults
  assert.equal(c.body.data.project.status, "Planning");
  assert.equal(c.body.data.project.budget, 0);
  assert.equal(c.body.data.project.client, "Internal");
  ids.analytics = c.body.data.project.id;

  assert.equal((await call("/projects", { method: "POST", body: project({ dueDate: "2026-07-01" }) })).status, 400);
  assert.equal((await call("/projects", { method: "POST", body: project({ progress: 150 }) })).status, 400);
  assert.equal((await call("/projects", { method: "POST", body: project({ budget: -5 }) })).status, 400);
  assert.equal((await call("/projects", { method: "POST", body: project({ name: "  " }) })).status, 400);

  const all = (await call("/projects")).body.data;
  assert.deepEqual(all.summary, { total: 3, inProgress: 1, completed: 1, totalBudget: 850000 + 250000, totalSpent: 425000 + 250000 });
  assert.equal(all.items[0].milestones, undefined); // list is lightweight
  assert.equal((await call("/projects?status=Completed")).body.data.items[0].name, "Employee Portal");
  assert.equal((await call("/projects?search=acme")).body.data.items.length, 1);

  const updated = await call(`/projects/${ids.erp}`, { method: "PUT", body: { progress: 60, spent: 500000 } });
  assert.equal(updated.body.data.project.progress, 60);
  assert.equal(updated.body.data.project.name, "ERP Platform Development"); // untouched
  assert.equal((await call(`/projects/${ids.erp}`, { method: "PUT", body: { startDate: "2027-01-01" } })).status, 400); // after due date
  assert.equal((await call("/projects/000000000000000000000000")).status, 404);
  assert.equal((await call("/projects/not-an-id")).status, 400);
});

test("milestones: add, update status, delete", async () => {
  const added = await call(`/projects/${ids.erp}/milestones`, { method: "POST", body: { title: "Requirements", dueDate: "2026-08-15" } });
  assert.equal(added.status, 201);
  const milestone = added.body.data.project.milestones[0];
  assert.deepEqual([milestone.title, milestone.dueDate, milestone.status], ["Requirements", "2026-08-15", "Upcoming"]);

  await call(`/projects/${ids.erp}/milestones`, { method: "POST", body: { title: "Testing", dueDate: "2026-12-01" } });
  assert.equal((await call(`/projects/${ids.erp}/milestones`, { method: "POST", body: { title: "", dueDate: "2026-12-01" } })).status, 400);

  const done = await call(`/projects/${ids.erp}/milestones/${milestone.id}`, { method: "PATCH", body: { status: "Completed" } });
  assert.equal(done.body.data.project.milestones[0].status, "Completed");
  assert.equal(done.body.data.project.milestones[1].status, "Upcoming");
  assert.equal((await call(`/projects/${ids.erp}/milestones/${milestone.id}`, { method: "PATCH", body: { status: "Done" } })).status, 400);
  assert.equal((await call(`/projects/${ids.erp}/milestones/000000000000000000000000`, { method: "PATCH", body: { status: "Completed" } })).status, 404);

  const removed = await call(`/projects/${ids.erp}/milestones/${milestone.id}`, { method: "DELETE" });
  assert.equal(removed.body.data.project.milestones.length, 1);

  const detail = (await call(`/projects/${ids.erp}`)).body.data;
  assert.equal(detail.project.milestones[0].title, "Testing");
});

test("resources: roster, assignment limits, team on project detail", async () => {
  const emp = async (name, email, overrides) => (await call("/hr/employees", { method: "POST", body: newEmployee(name, email, overrides) })).body.data.employee.id;
  ids.priya = await emp("Priya Das", "priya@amdox.com");
  ids.amit = await emp("Amit Kumar", "amit@amdox.com", { department: "Design" });
  ids.gone = await emp("Gone Person", "gone@amdox.com", { status: "Inactive" });

  let roster = (await call("/projects/resources")).body.data;
  assert.equal(roster.items.length, 2); // inactive excluded
  assert.deepEqual(roster.summary, { total: 2, assigned: 0, partiallyAvailable: 0, unassigned: 2 });
  assert.deepEqual(roster.projects.map((p) => p.name), ["ERP Platform Development", "Analytics"]); // Completed excluded
  assert.deepEqual(roster.departments, ["Design", "Engineering"]);

  const assign = (employeeId, projectId, allocation) =>
    call("/projects/resources/assign", { method: "PUT", body: { employeeId, projectId, allocation } });

  assert.equal((await assign(ids.priya, ids.erp, 60)).status, 200);
  assert.equal((await assign(ids.priya, ids.analytics, 30)).status, 200);
  const tooMuch = await assign(ids.priya, ids.analytics, 50); // 60 elsewhere + 50 > 100
  assert.equal(tooMuch.status, 400);
  assert.match(tooMuch.body.message, /60%/);
  assert.equal((await assign(ids.priya, ids.erp, 70)).status, 200); // changing the existing share is fine (70 + 30)
  assert.equal((await assign(ids.priya, ids.portal, 10)).status, 400); // completed project
  assert.equal((await assign(ids.gone, ids.erp, 10)).status, 400); // inactive employee
  assert.equal((await assign(ids.amit, ids.erp, 0)).status, 400);
  assert.equal((await assign(ids.amit, ids.erp, 101)).status, 400);
  assert.equal((await assign(ids.amit, "000000000000000000000000", 10)).status, 404);

  await assign(ids.amit, ids.erp, 40);

  roster = (await call("/projects/resources")).body.data;
  const priya = roster.items.find((i) => i.name === "Priya Das");
  assert.deepEqual([priya.allocation, priya.hours, priya.status], [100, 40, "Fully Allocated"]);
  assert.equal(priya.assignments.length, 2);
  const amit = roster.items.find((i) => i.name === "Amit Kumar");
  assert.deepEqual([amit.allocation, amit.hours, amit.status], [40, 16, "Available"]);
  assert.deepEqual(roster.summary, { total: 2, assigned: 2, partiallyAvailable: 1, unassigned: 0 });

  assert.equal((await call("/projects/resources?status=Fully%20Allocated")).body.data.items.length, 1);
  assert.equal((await call("/projects/resources?department=Design")).body.data.items[0].name, "Amit Kumar");
  assert.equal((await call("/projects/resources?search=priya")).body.data.items.length, 1);
  // filters narrow the list but the summary still covers everyone
  assert.equal((await call("/projects/resources?search=priya")).body.data.summary.total, 2);

  const detail = (await call(`/projects/${ids.erp}`)).body.data;
  assert.deepEqual(detail.team.map((t) => [t.employee.name, t.allocation]).sort(), [["Amit Kumar", 40], ["Priya Das", 70]]);

  // an assigned employee cannot be deleted from HR
  assert.equal((await call(`/hr/employees/${ids.amit}`, { method: "DELETE" })).status, 409);

  const unassignId = amit.assignments[0].id;
  assert.equal((await call(`/projects/resources/assignments/${unassignId}`, { method: "DELETE" })).status, 200);
  assert.equal((await call(`/projects/resources/assignments/${unassignId}`, { method: "DELETE" })).status, 404);
  assert.equal((await call("/projects/resources")).body.data.summary.unassigned, 1);
});

test("deleting a project removes its assignments", async () => {
  assert.equal((await call(`/projects/${ids.erp}`, { method: "DELETE" })).status, 200);
  assert.equal((await call(`/projects/${ids.erp}`, { method: "DELETE" })).status, 404);
  const priya = (await call("/projects/resources?search=priya")).body.data.items[0];
  assert.deepEqual(priya.assignments.map((a) => a.project.name), ["Analytics"]);
  assert.equal(priya.allocation, 30);
});
