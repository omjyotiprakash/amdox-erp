const authService = require("../services/authService");

const register = async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token } });
};

const registration = async (_req, res) => {
  res.json({ success: true, data: { open: await authService.registrationOpen() } });
};

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ success: true, data: { user, token } });
};

const changePassword = async (req, res) => {
  const { user, token } = await authService.changePassword(req.user._id, req.body);
  res.json({ success: true, data: { user, token } });
};

const me = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

module.exports = { register, registration, login, changePassword, me };
