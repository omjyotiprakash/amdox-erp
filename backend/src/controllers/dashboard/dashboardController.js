const dashboardService = require("../../services/dashboard/dashboardService");

const summary = async (req, res) => {
  res.json({ success: true, data: await dashboardService.summary(req.user) });
};

module.exports = { summary };
