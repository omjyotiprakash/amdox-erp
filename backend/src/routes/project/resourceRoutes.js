const express = require("express");
const controller = require("../../controllers/project/resourceController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { assignSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("projects", "view"), controller.list);
router.put("/assign", authorize("projects", "edit"), validate(assignSchema), controller.assign);
router.delete("/assignments/:id", authorize("projects", "edit"), controller.unassign);

module.exports = router;
