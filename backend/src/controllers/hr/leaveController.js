const leaveService = require("../../services/hr/leaveService");

const list = async (req, res) => {
  const { search, status, page, limit } = req.query;
  res.json({ success: true, data: await leaveService.list({ search, status, page, limit }, req.user) });
};

const create = async (req, res) => {
  const leave = await leaveService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { leave } });
};

const decide = async (req, res) => {
  const leave = await leaveService.decide(req.params.id, req.body.status, req.user);
  res.json({ success: true, data: { leave } });
};

const remove = async (req, res) => {
  await leaveService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, decide, remove };
