const inventoryService = require("../../services/supplyChain/inventoryService");

const list = async (req, res) => {
  const { search, category, stock, page, limit } = req.query;
  res.json({ success: true, data: await inventoryService.list({ search, category, stock, page, limit }) });
};

const create = async (req, res) => {
  const product = await inventoryService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { product } });
};

const update = async (req, res) => {
  const product = await inventoryService.update(req.params.id, req.body);
  res.json({ success: true, data: { product } });
};

const setStock = async (req, res) => {
  const product = await inventoryService.setStock(req.params.id, req.body.quantity);
  res.json({ success: true, data: { product } });
};

const remove = async (req, res) => {
  await inventoryService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, update, setStock, remove };
