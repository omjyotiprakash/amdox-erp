const userService = require("../services/settings/userService");

const list = async (req, res) => {
  const { search, roleId, status } = req.query;
  res.json({ success: true, data: await userService.list({ search, roleId, status }) });
};

const create = async (req, res) => {
  res.status(201).json({ success: true, data: { user: await userService.create(req.body) } });
};

const update = async (req, res) => {
  const user = await userService.update(req.params.id, req.body, req.user);
  res.json({ success: true, data: { user } });
};

module.exports = { list, create, update };
