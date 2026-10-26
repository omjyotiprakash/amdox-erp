const express = require("express");
const controller = require("../controllers/meController");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { leaveSchema } = require("./hr/schemas");

const router = express.Router();

// Self-service: any signed-in person, but only ever their own record (no module permission needed).
router.use(authenticate);

// The employee is taken from the account, so a request can never name someone else.
const myLeaveSchema = leaveSchema.omit({ employeeId: true });

router.get("/profile", controller.profile);
router.get("/attendance", controller.attendance);
router.get("/leave", controller.leave);
router.post("/leave", validate(myLeaveSchema), controller.requestLeave);
router.delete("/leave/:id", controller.cancelLeave);
router.get("/payslips", controller.payslips);

module.exports = router;
