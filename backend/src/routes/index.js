const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));
router.use("/auth", require("./authRoutes"));

// Finance
router.use("/finance/ledger", require("./finance/ledgerRoutes"));
router.use("/finance/payables", require("./finance/apRoutes"));
router.use("/finance/receivables", require("./finance/arRoutes"));
router.use("/finance/reports", require("./finance/financeReportRoutes"));

// Human resources
router.use("/hr/employees", require("./hr/employeeRoutes"));
router.use("/hr/attendance", require("./hr/attendanceRoutes"));
router.use("/hr/leave", require("./hr/leaveRoutes"));
router.use("/hr/payroll", require("./hr/payrollRoutes"));

module.exports = router;
