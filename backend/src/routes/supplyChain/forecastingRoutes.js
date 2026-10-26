const express = require("express");
const controller = require("../../controllers/supplyChain/forecastingController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("supplyChain", "view"), controller.forecast);

module.exports = router;
