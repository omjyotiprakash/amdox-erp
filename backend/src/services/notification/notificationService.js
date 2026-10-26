const Transaction = require("../../models/finance/Transaction");
const Invoice = require("../../models/finance/Invoice");
const Leave = require("../../models/hr/Leave");
const Product = require("../../models/supplyChain/Inventory");
const PurchaseOrder = require("../../models/supplyChain/PurchaseOrder");
const Project = require("../../models/project/Project");
const Setting = require("../../models/Setting");
const { startOfTodayUTC } = require("../../utils/common");

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// Alerts are worked out from live data each time, so they can never be stale and need no storage.
// Each user only sees alerts for modules their role can view.
const forUser = async (user) => {
  const can = (module) => Boolean(user.role?.permissions?.[module]?.view);
  const today = startOfTodayUTC();
  const settings = await Setting.current();
  const alerts = [];
  const add = (id, level, title, link) => alerts.push({ id, level, title, link });

  const jobs = [];

  if (can("finance")) {
    jobs.push(
      Invoice.countDocuments({ kind: "payable", status: "Pending", dueDate: { $lt: today } }).then((n) =>
        n && add("overdue-payables", "danger", `${plural(n, "vendor invoice is", "vendor invoices are")} overdue`, "/finance/payables")
      ),
      Invoice.countDocuments({ kind: "receivable", status: "Pending", dueDate: { $lt: today } }).then((n) =>
        n && add("overdue-receivables", "warning", `${plural(n, "customer invoice is", "customer invoices are")} overdue`, "/finance/receivables")
      ),
      Transaction.countDocuments({ status: "Pending" }).then((n) =>
        n && add("pending-transactions", "info", `${plural(n, "ledger transaction is", "ledger transactions are")} still pending`, "/finance/ledger")
      )
    );
  }

  if (can("hr")) {
    jobs.push(
      Leave.countDocuments({ status: "Pending" }).then((n) =>
        n && add("pending-leave", "warning", `${plural(n, "leave request awaits", "leave requests await")} approval`, "/hr/leave")
      )
    );
  }

  if (can("supplyChain")) {
    jobs.push(
      PurchaseOrder.countDocuments({ status: "Pending" }).then((n) =>
        n && add("pending-orders", "warning", `${plural(n, "purchase order awaits", "purchase orders await")} approval`, "/supply-chain/purchase-orders")
      )
    );
    if (settings.lowStockAlerts) {
      jobs.push(
        Product.countDocuments({ quantity: 0 }).then((n) =>
          n && add("out-of-stock", "danger", `${plural(n, "product is", "products are")} out of stock`, "/supply-chain/inventory")
        ),
        Product.countDocuments({ quantity: { $gt: 0 }, $expr: { $lte: ["$quantity", "$reorderLevel"] } }).then((n) =>
          n && add("low-stock", "warning", `${plural(n, "product is", "products are")} low on stock`, "/supply-chain/inventory")
        )
      );
    }
  }

  if (can("projects")) {
    const open = { status: { $nin: ["Completed", "Cancelled"] } };
    jobs.push(
      Project.countDocuments({ ...open, dueDate: { $lt: today } }).then((n) =>
        n && add("late-projects", "danger", `${plural(n, "project is", "projects are")} past the due date`, "/projects")
      ),
      Project.countDocuments({ ...open, budget: { $gt: 0 }, $expr: { $gt: ["$spent", "$budget"] } }).then((n) =>
        n && add("over-budget", "warning", `${plural(n, "project is", "projects are")} over budget`, "/projects")
      )
    );
  }

  await Promise.all(jobs);

  const order = { danger: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.level] - order[b.level] || a.id.localeCompare(b.id));
};

module.exports = { forUser };
