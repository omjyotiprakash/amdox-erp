const express = require("express");
const controller = require("../../controllers/finance/ledgerController");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { transactionSchema, transactionUpdateSchema } = require("./schemas");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("finance", "view"), controller.list);
router.post("/", authorize("finance", "create"), validate(transactionSchema), controller.create);
router.put("/:id", authorize("finance", "edit"), validate(transactionUpdateSchema), controller.update);
router.delete("/:id", authorize("finance", "delete"), controller.remove);

module.exports = router;
