const authService = require("../services/authService");

const register = async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token } });
};

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ success: true, data: { user, token } });
};

const me = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

module.exports = { register, login, me };
