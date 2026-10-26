const attendanceService = require("../../services/hr/attendanceService");
const { AppError } = require("../../middleware/errorHandler.middleware");

const daily = async (req, res) => {
  const value = req.query.date || new Date().toISOString().slice(0, 10);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
    throw new AppError(400, "Date must be a valid date (YYYY-MM-DD)");
  }
  res.json({ success: true, data: await attendanceService.daily(date) });
};

const mark = async (req, res) => {
  const record = await attendanceService.mark(req.body, req.user._id);
  res.json({ success: true, data: { record } });
};

module.exports = { daily, mark };
