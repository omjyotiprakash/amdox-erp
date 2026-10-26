const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { EJSON } = require("bson");

// Extended JSON keeps ObjectIds, Dates and numbers exactly as MongoDB stored them.
const fileFor = (dir, name) => path.join(dir, `${name}.json`);

// Writes every collection of the connected database to <dir>/<collection>.json
const backupDatabase = async (dir) => {
  fs.mkdirSync(dir, { recursive: true });
  const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
  const summary = {};

  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;
    const docs = await mongoose.connection.db.collection(name).find({}).toArray();
    fs.writeFileSync(fileFor(dir, name), EJSON.stringify(docs, { relaxed: false }, 2));
    summary[name] = docs.length;
  }
  return summary;
};

// Loads a backup folder back in. Collections that already hold data are skipped
// unless `replace` is true, so a restore can never silently overwrite live records.
const restoreDatabase = async (dir, { replace = false } = {}) => {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
  const summary = {};

  for (const file of files) {
    const name = path.basename(file, ".json");
    const collection = mongoose.connection.db.collection(name);
    const existing = await collection.countDocuments();

    if (existing > 0 && !replace) {
      summary[name] = `skipped (${existing} existing documents)`;
      continue;
    }

    const docs = EJSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    if (replace) await collection.deleteMany({});
    if (docs.length) await collection.insertMany(docs);
    summary[name] = docs.length;
  }
  return summary;
};

module.exports = { backupDatabase, restoreDatabase };
