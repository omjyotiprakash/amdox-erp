const express = require("express");
const controller = require("../../controllers/project/projectController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { projectSchema, projectUpdateSchema, milestoneSchema, milestoneStatusSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("projects", "view"), controller.list);
router.post("/", authorize("projects", "create"), validate(projectSchema), controller.create);
router.get("/:id", authorize("projects", "view"), controller.get);
router.put("/:id", authorize("projects", "edit"), validate(projectUpdateSchema), controller.update);
router.delete("/:id", authorize("projects", "delete"), controller.remove);

router.post("/:id/milestones", authorize("projects", "edit"), validate(milestoneSchema), controller.addMilestone);
router.patch(
  "/:id/milestones/:milestoneId",
  authorize("projects", "edit"),
  validate(milestoneStatusSchema),
  controller.setMilestoneStatus
);
router.delete("/:id/milestones/:milestoneId", authorize("projects", "edit"), controller.removeMilestone);

module.exports = router;
