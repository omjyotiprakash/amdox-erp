const express = require("express");
const controller = require("../../controllers/settings/roleController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { roleSchema, rolePermissionsSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("settings", "view"), controller.list);
router.post("/", authorize("settings", "create"), validate(roleSchema), controller.create);
router.put("/:id/permissions", authorize("settings", "edit"), validate(rolePermissionsSchema), controller.updatePermissions);
router.delete("/:id", authorize("settings", "delete"), controller.remove);

module.exports = router;
