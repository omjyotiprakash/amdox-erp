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

// Supply chain
router.use("/supply-chain/inventory", require("./supplyChain/inventoryRoutes"));
router.use("/supply-chain/vendors", require("./supplyChain/vendorRoutes"));
router.use("/supply-chain/purchase-orders", require("./supplyChain/poRoutes"));
router.use("/supply-chain/forecasting", require("./supplyChain/forecastingRoutes"));

// Projects ("/projects/resources" is mounted first so it is not read as a project id)
router.use("/projects/resources", require("./project/resourceRoutes"));
router.use("/projects", require("./project/projectRoutes"));

// Dashboard and notifications
router.use("/dashboard", require("./dashboard/dashboardRoutes"));
router.use("/notifications", require("./notification/notificationRoutes"));

// Settings and administration
router.use("/settings/general", require("./settings/settingsRoutes"));
router.use("/settings/integrations", require("./settings/integrationRoutes"));
router.use("/settings/roles", require("./settings/roleRoutes"));
router.use("/settings/users", require("./userRoutes"));
router.use("/settings/audit", require("./settings/auditRoutes"));

module.exports = router;
