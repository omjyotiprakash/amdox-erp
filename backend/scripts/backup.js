// Usage:
//   npm run backup                      saves the database to backups/<timestamp>/
//   npm run restore -- backups/<name>   loads a backup into EMPTY collections only
//   npm run restore -- backups/<name> --replace   overwrites collections (asks for --yes)
const path = require("path");
const env = require("../src/config/env");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const { backupDatabase, restoreDatabase } = require("./dbBackup");

const [command, ...args] = process.argv.slice(2);

const run = async () => {
  await connectDatabase();

  if (command === "backup") {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.join(__dirname, "..", "backups", stamp);
    const summary = await backupDatabase(dir);
    console.log(`Backup saved to ${dir}`);
    console.table(summary);
    return;
  }

  if (command === "restore") {
    const folder = args.find((arg) => !arg.startsWith("--"));
    const replace = args.includes("--replace");
    if (!folder) throw new Error("Tell me which backup folder to restore, e.g. npm run restore -- backups/2026-10-26T10-00-00-000Z");
    if (replace && !args.includes("--yes")) {
      throw new Error("--replace deletes current data in the collections found in the backup. Add --yes to confirm.");
    }
    console.log(`Restoring into ${new URL(env.mongoUri.replace("mongodb+srv", "https").replace("mongodb", "http")).host}`);
    console.table(await restoreDatabase(path.resolve(folder), { replace }));
    return;
  }

  throw new Error('Use "backup" or "restore".');
};

run()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
