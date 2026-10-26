const express = require("express");
const controller = require("../../controllers/hr/payrollController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { payrollGenerateSchema, payrollStatusSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("hr", "view"), controller.list);
router.post("/generate", authorize("hr", "create"), validate(payrollGenerateSchema), controller.generate);
router.patch("/:id/status", authorize("hr", "edit"), validate(payrollStatusSchema), controller.setStatus);

module.exports = router;
