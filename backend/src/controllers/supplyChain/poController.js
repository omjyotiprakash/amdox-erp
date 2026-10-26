const poService = require("../../services/supplyChain/poService");

const list = async (req, res) => {
  const { search, status, vendorId, page, limit } = req.query;
  res.json({ success: true, data: await poService.list({ search, status, vendorId, page, limit }) });
};

const create = async (req, res) => {
  const order = await poService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { order } });
};

const setStatus = async (req, res) => {
  const order = await poService.setStatus(req.params.id, req.body.status);
  res.json({ success: true, data: { order } });
};

const remove = async (req, res) => {
  await poService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, setStatus, remove };
