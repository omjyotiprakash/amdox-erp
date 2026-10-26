const express = require("express");
const controller = require("../../controllers/settings/settingsController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { settingsSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("settings", "view"), controller.get);
router.put("/", authorize("settings", "edit"), validate(settingsSchema), controller.update);

module.exports = router;
