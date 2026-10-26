const { createInvoiceController } = require("./invoiceController");

module.exports = createInvoiceController(require("../../services/finance/apService"));
