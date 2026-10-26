const express = require("express");
const controller = require("../../controllers/hr/employeeController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { employeeSchema, employeeUpdateSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("hr", "view"), controller.list);
router.post("/", authorize("hr", "create"), validate(employeeSchema), controller.create);
router.put("/:id", authorize("hr", "edit"), validate(employeeUpdateSchema), controller.update);
router.delete("/:id", authorize("hr", "delete"), controller.remove);

module.exports = router;
