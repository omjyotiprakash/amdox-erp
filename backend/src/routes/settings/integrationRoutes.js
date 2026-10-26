const express = require("express");
const controller = require("../../controllers/settings/integrationController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { integrationSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("settings", "view"), controller.list);
router.put("/:key", authorize("settings", "edit"), validate(integrationSchema), controller.setEnabled);

module.exports = router;
