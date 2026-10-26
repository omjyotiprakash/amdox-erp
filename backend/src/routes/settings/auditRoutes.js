const express = require("express");
const auditService = require("../../services/common/auditService");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("settings", "view"), async (req, res) => {
  const { search, action, page, limit } = req.query;
  res.json({ success: true, data: await auditService.list({ search, action, page, limit }) });
});

module.exports = router;
