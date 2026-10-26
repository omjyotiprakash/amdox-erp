const vendorService = require("../../services/supplyChain/vendorService");

const list = async (req, res) => {
  const { search, category, status, page, limit } = req.query;
  res.json({ success: true, data: await vendorService.list({ search, category, status, page, limit }) });
};

const create = async (req, res) => {
  const vendor = await vendorService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { vendor } });
};

const update = async (req, res) => {
  const vendor = await vendorService.update(req.params.id, req.body);
  res.json({ success: true, data: { vendor } });
};

const remove = async (req, res) => {
  await vendorService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, update, remove };
