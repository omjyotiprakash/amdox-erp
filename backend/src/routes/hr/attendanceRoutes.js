const express = require("express");
const controller = require("../../controllers/hr/attendanceController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { attendanceSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("hr", "view"), controller.daily);
router.put("/", authorize("hr", "edit"), validate(attendanceSchema), controller.mark);

module.exports = router;
