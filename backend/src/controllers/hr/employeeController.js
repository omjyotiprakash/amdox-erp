const employeeService = require("../../services/hr/employeeService");

const list = async (req, res) => {
  const { search, department, status, page, limit } = req.query;
  res.json({ success: true, data: await employeeService.list({ search, department, status, page, limit }) });
};

const create = async (req, res) => {
  const employee = await employeeService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { employee } });
};

const update = async (req, res) => {
  const employee = await employeeService.update(req.params.id, req.body);
  res.json({ success: true, data: { employee } });
};

const remove = async (req, res) => {
  await employeeService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

module.exports = { list, create, update, remove };
