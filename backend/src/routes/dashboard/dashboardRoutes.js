const express = require("express");
const controller = require("../../controllers/dashboard/dashboardController");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

// Every signed-in user can open the dashboard; the service only returns the modules their role may view.
router.get("/summary", authenticate, controller.summary);

module.exports = router;
