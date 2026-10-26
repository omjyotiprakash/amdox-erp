const selfService = require("../services/hr/selfService");
const { AppError } = require("../middleware/errorHandler.middleware");

const profile = async (req, res) => {
  res.json({ success: true, data: await selfService.profile(req.user) });
};

const attendance = async (req, res) => {
  const { month } = req.query;
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new AppError(400, "Month must be in YYYY-MM format");
  res.json({ success: true, data: await selfService.attendance(req.user, month) });
};

const leave = async (req, res) => {
  res.json({ success: true, data: await selfService.leave(req.user) });
};

const requestLeave = async (req, res) => {
  const request = await selfService.requestLeave(req.user, req.body);
  res.status(201).json({ success: true, data: { leave: request } });
};

const cancelLeave = async (req, res) => {
  await selfService.cancelLeave(req.user, req.params.id);
  res.json({ success: true, data: {} });
};

const payslips = async (req, res) => {
  res.json({ success: true, data: await selfService.payslips(req.user) });
};

module.exports = { profile, attendance, leave, requestLeave, cancelLeave, payslips };
