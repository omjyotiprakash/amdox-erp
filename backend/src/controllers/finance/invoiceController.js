// Builds the HTTP handlers for an invoice service (shared by payables and receivables).
const createInvoiceController = (service) => ({
  list: async (req, res) => {
    const { search, status, page, limit } = req.query;
    res.json({ success: true, data: await service.list({ search, status, page, limit }) });
  },

  create: async (req, res) => {
    const invoice = await service.create(req.body, req.user._id);
    res.status(201).json({ success: true, data: { invoice } });
  },

  markPaid: async (req, res) => {
    const invoice = await service.markPaid(req.params.id);
    res.json({ success: true, data: { invoice } });
  },

  remove: async (req, res) => {
    await service.remove(req.params.id);
    res.json({ success: true, data: {} });
  },
});

module.exports = { createInvoiceController };
