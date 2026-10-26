const express = require("express");
const controller = require("../../controllers/supplyChain/poController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { purchaseOrderSchema, poStatusSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("supplyChain", "view"), controller.list);
router.post("/", authorize("supplyChain", "create"), validate(purchaseOrderSchema), controller.create);
router.patch("/:id/status", authorize("supplyChain", "edit"), validate(poStatusSchema), controller.setStatus);
router.delete("/:id", authorize("supplyChain", "delete"), controller.remove);

module.exports = router;
