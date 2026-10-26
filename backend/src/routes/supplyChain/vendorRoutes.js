const express = require("express");
const controller = require("../../controllers/supplyChain/vendorController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { vendorSchema, vendorUpdateSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("supplyChain", "view"), controller.list);
router.post("/", authorize("supplyChain", "create"), validate(vendorSchema), controller.create);
router.put("/:id", authorize("supplyChain", "edit"), validate(vendorUpdateSchema), controller.update);
router.delete("/:id", authorize("supplyChain", "delete"), controller.remove);

module.exports = router;
