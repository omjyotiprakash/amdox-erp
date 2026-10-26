const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const { backupDatabase, restoreDatabase } = require("../scripts/dbBackup");
const Transaction = require("../src/models/finance/Transaction");

let mongo;
let dir;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "amdox-backup-"));
});

after(async () => {
  fs.rmSync(dir, { recursive: true, force: true });
  await disconnectDatabase();
  await mongo.stop();
});

test("backup then restore brings back identical data, types included", async () => {
  const original = await Transaction.create({
    code: "TXN-9001",
    date: new Date("2026-10-01T00:00:00.000Z"),
    description: "Backed up sale",
    account: "Sales",
    type: "Income",
    amount: 1234.5,
  });

  const saved = await backupDatabase(dir);
  assert.equal(saved.transactions, 1);
  assert.ok(fs.existsSync(path.join(dir, "transactions.json")));

  await Transaction.deleteMany({});
  assert.equal(await Transaction.countDocuments(), 0);

  const restored = await restoreDatabase(dir);
  assert.equal(restored.transactions, 1);

  const back = await Transaction.findOne({ code: "TXN-9001" });
  assert.equal(back.id, original.id); // same ObjectId
  assert.ok(back.date instanceof Date);
  assert.equal(back.date.toISOString(), "2026-10-01T00:00:00.000Z");
  assert.equal(back.amount, 1234.5);
});

test("restore never overwrites existing data unless asked", async () => {
  await Transaction.updateOne({ code: "TXN-9001" }, { description: "Edited after backup" });

  const skipped = await restoreDatabase(dir);
  assert.match(skipped.transactions, /skipped/);
  assert.equal((await Transaction.findOne({ code: "TXN-9001" })).description, "Edited after backup");

  const replaced = await restoreDatabase(dir, { replace: true });
  assert.equal(replaced.transactions, 1);
  assert.equal((await Transaction.findOne({ code: "TXN-9001" })).description, "Backed up sale");
  assert.equal(await mongoose.connection.db.collection("transactions").countDocuments(), 1); // no duplicates
});
