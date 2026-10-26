const permissionService = require("../../services/settings/permissionService");

const list = async (req, res) => {
  res.json({ success: true, data: await permissionService.list({ search: req.query.search }) });
};

const create = async (req, res) => {
  res.status(201).json({ success: true, data: { role: await permissionService.create(req.body) } });
};

const updatePermissions = async (req, res) => {
  const role = await permissionService.updatePermissions(req.params.id, req.body.permissions);
  res.json({ success: true, data: { role } });
};

const remove = async (req, res) => {
  await permissionService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, updatePermissions, remove };
