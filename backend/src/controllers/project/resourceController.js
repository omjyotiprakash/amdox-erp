const resourceService = require("../../services/project/resourceService");

const list = async (req, res) => {
  const { search, department, status } = req.query;
  res.json({ success: true, data: await resourceService.list({ search, department, status }) });
};

const assign = async (req, res) => {
  const assignment = await resourceService.assign(req.body, req.user._id);
  res.json({ success: true, data: { assignment } });
};

const unassign = async (req, res) => {
  await resourceService.unassign(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, assign, unassign };
