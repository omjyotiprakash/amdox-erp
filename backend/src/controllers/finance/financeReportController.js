const financeReportService = require("../../services/finance/financeReportService");

const summary = async (req, res) => {
  const months = [3, 6, 12].includes(Number(req.query.months)) ? Number(req.query.months) : 6;
  res.json({ success: true, data: await financeReportService.summary(months) });
};

module.exports = { summary };
