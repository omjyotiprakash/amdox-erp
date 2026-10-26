const Setting = require("../../models/Setting");
const { AppError } = require("../../middleware/errorHandler.middleware");

// The catalogue of services the ERP can be linked to. Enabling one records the choice for the
// workspace; it does not store credentials or call the provider. Live sync would be configured
// on the server with environment variables.
const CATALOGUE = [
  { key: "mongodb", name: "MongoDB Atlas", category: "Database", icon: "DB", featured: true, locked: true,
    description: "Cloud database for storing application data. Always on: the ERP cannot run without it." },
  { key: "stripe", name: "Stripe", category: "Payments", icon: "ST", featured: true,
    description: "Payment processing for online transactions." },
  { key: "google", name: "Google Workspace", category: "Productivity", icon: "GW",
    description: "Connect business email and productivity services." },
  { key: "slack", name: "Slack", category: "Communication", icon: "SL",
    description: "Send project updates and notifications to channels." },
  { key: "teams", name: "Microsoft Teams", category: "Communication", icon: "MT",
    description: "Coordinate teams and receive workflow notifications." },
  { key: "github", name: "GitHub", category: "Development", icon: "GH",
    description: "Connect repositories and track development activity." },
];

const list = async () => {
  const settings = await Setting.current();
  return CATALOGUE.map((item) => ({
    ...item,
    enabled: item.locked ? true : Boolean(settings.integrations.get(item.key)),
  }));
};

const setEnabled = async (key, enabled) => {
  const item = CATALOGUE.find((entry) => entry.key === key);
  if (!item) throw new AppError(404, "Integration not found");
  if (item.locked) throw new AppError(400, `${item.name} is required and cannot be disabled`);

  await Setting.findOneAndUpdate(
    { _id: "default" },
    { $set: { [`integrations.${key}`]: enabled } },
    { upsert: true }
  );
  return (await list()).find((entry) => entry.key === key);
};

module.exports = { list, setEnabled };
