const settingsService = require("../../services/settings/settingsService");

const get = async (_req, res) => {
  res.json({ success: true, data: { settings: await settingsService.get() } });
};

const update = async (req, res) => {
  res.json({ success: true, data: { settings: await settingsService.update(req.body) } });
};

module.exports = { get, update };
