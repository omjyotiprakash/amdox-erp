const ledgerService = require("../../services/finance/ledgerService");

const list = async (req, res) => {
  const { search, type, page, limit } = req.query;
  const data = await ledgerService.list({ search, type, page, limit });
  res.json({ success: true, data });
};

const create = async (req, res) => {
  const transaction = await ledgerService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { transaction } });
};

const update = async (req, res) => {
  const transaction = await ledgerService.update(req.params.id, req.body);
  res.json({ success: true, data: { transaction } });
};

const remove = async (req, res) => {
  await ledgerService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, update, remove };
