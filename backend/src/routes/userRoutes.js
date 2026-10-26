const express = require("express");
const controller = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { userSchema, userUpdateSchema } = require("./settings/schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("settings", "view"), controller.list);
router.post("/", authorize("settings", "create"), validate(userSchema), controller.create);
router.put("/:id", authorize("settings", "edit"), validate(userUpdateSchema), controller.update);

module.exports = router;
