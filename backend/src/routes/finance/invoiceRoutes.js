const express = require("express");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { invoiceSchema } = require("./schemas");

// Builds the router for a payables/receivables controller.
const createInvoiceRoutes = (controller) => {
  const router = express.Router();

  router.use(authenticate);

  router.get("/", authorize("finance", "view"), controller.list);
  router.post("/", authorize("finance", "create"), validate(invoiceSchema), controller.create);
  router.patch("/:id/pay", authorize("finance", "edit"), controller.markPaid);
  router.delete("/:id", authorize("finance", "delete"), controller.remove);

  return router;
};

module.exports = { createInvoiceRoutes };
