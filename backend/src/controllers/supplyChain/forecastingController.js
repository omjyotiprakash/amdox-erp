const forecastingService = require("../../services/supplyChain/forecastingService");

const forecast = async (req, res) => {
  const months = [1, 3, 6].includes(Number(req.query.months)) ? Number(req.query.months) : 1;
  const { category, search } = req.query;
  res.json({ success: true, data: await forecastingService.forecast({ months, category, search }) });
};

module.exports = { forecast };
