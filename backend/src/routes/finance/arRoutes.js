const { createInvoiceRoutes } = require("./invoiceRoutes");

module.exports = createInvoiceRoutes(require("../../controllers/finance/arController"));
