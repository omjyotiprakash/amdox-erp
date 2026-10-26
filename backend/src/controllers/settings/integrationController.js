const integrationService = require("../../services/settings/integrationService");

const list = async (_req, res) => {
  res.json({ success: true, data: { items: await integrationService.list() } });
};

const setEnabled = async (req, res) => {
  const integration = await integrationService.setEnabled(req.params.key, req.body.enabled);
  res.json({ success: true, data: { integration } });
};

module.exports = { list, setEnabled };
