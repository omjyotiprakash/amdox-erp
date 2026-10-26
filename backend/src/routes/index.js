const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));
router.use("/auth", require("./authRoutes"));

// Finance
router.use("/finance/ledger", require("./finance/ledgerRoutes"));
router.use("/finance/payables", require("./finance/apRoutes"));
router.use("/finance/receivables", require("./finance/arRoutes"));
router.use("/finance/reports", require("./finance/financeReportRoutes"));

module.exports = router;
