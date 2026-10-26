const express = require("express");
const controller = require("../../controllers/notification/notificationController");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.list);

module.exports = router;
