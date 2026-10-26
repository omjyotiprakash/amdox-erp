const notificationService = require("../../services/notification/notificationService");

const list = async (req, res) => {
  const items = await notificationService.forUser(req.user);
  res.json({ success: true, data: { items, count: items.length } });
};

module.exports = { list };
