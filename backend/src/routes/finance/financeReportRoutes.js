const express = require("express");
const controller = require("../../controllers/finance/financeReportController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/summary", authenticate, authorize("reports", "view"), controller.summary);

module.exports = router;
