const express = require("express");
const controller = require("../../controllers/supplyChain/inventoryController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { productSchema, productUpdateSchema, stockSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("supplyChain", "view"), controller.list);
router.post("/", authorize("supplyChain", "create"), validate(productSchema), controller.create);
router.put("/:id", authorize("supplyChain", "edit"), validate(productUpdateSchema), controller.update);
router.patch("/:id/stock", authorize("supplyChain", "edit"), validate(stockSchema), controller.setStock);
router.delete("/:id", authorize("supplyChain", "delete"), controller.remove);

module.exports = router;
