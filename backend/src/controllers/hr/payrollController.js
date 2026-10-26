const payrollEngine = require("../../services/hr/payrollEngine");
const { AppError } = require("../../middleware/errorHandler.middleware");

const currentMonth = () => new Date().toISOString().slice(0, 7);

const list = async (req, res) => {
  const month = req.query.month || currentMonth();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new AppError(400, "Month must be in YYYY-MM format");
  const { search, status } = req.query;
  res.json({ success: true, data: await payrollEngine.list({ month, search, status }) });
};

const generate = async (req, res) => {
  const result = await payrollEngine.generate(req.body.month, req.user._id);
  res.status(201).json({ success: true, data: result });
};

const setStatus = async (req, res) => {
  const payroll = await payrollEngine.setStatus(req.params.id, req.body.status);
  res.json({ success: true, data: { payroll } });
};

module.exports = { list, generate, setStatus };
