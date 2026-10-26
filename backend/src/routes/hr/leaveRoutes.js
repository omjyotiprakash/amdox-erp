const express = require("express");
const controller = require("../../controllers/hr/leaveController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { leaveSchema, leaveDecisionSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("hr", "view"), controller.list);
router.post("/", authorize("hr", "create"), validate(leaveSchema), controller.create);
router.patch("/:id/decision", authorize("hr", "edit"), validate(leaveDecisionSchema), controller.decide);
router.delete("/:id", authorize("hr", "delete"), controller.remove);

module.exports = router;
