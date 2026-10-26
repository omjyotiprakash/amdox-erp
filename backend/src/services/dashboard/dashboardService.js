const Transaction = require("../../models/finance/Transaction");
const Invoice = require("../../models/finance/Invoice");
const Employee = require("../../models/hr/Employee");
const Leave = require("../../models/hr/Leave");
const Product = require("../../models/supplyChain/Inventory");
const PurchaseOrder = require("../../models/supplyChain/PurchaseOrder");
const Project = require("../../models/project/Project");
const { MODULES } = require("../../models/Permission");
const { startOfTodayUTC } = require("../../utils/common");

const sum = (rows, type) => rows.find((row) => row._id === type)?.total || 0;

// Headline numbers for the dashboard. A section is only included when the user's role can view that module.
const summary = async (user) => {
  const can = (module) => Boolean(user.role?.permissions?.[module]?.view);
  const today = startOfTodayUTC();
  const data = {
    modules: MODULES.filter(can),
    greetingName: user.name,
  };
  const jobs = [];

  if (can("finance")) {
    jobs.push(
      Promise.all([
        Transaction.aggregate([{ $match: { status: "Posted" } }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]),
        Invoice.countDocuments({ kind: "payable", status: "Pending", dueDate: { $lt: today } }),
        Invoice.countDocuments({ kind: "receivable", status: "Pending", dueDate: { $lt: today } }),
      ]).then(([rows, overduePayables, overdueReceivables]) => {
        const income = sum(rows, "Income");
        const expenses = sum(rows, "Expense");
        data.finance = { income, expenses, net: income - expenses, overduePayables, overdueReceivables };
      })
    );
  }

  if (can("hr")) {
    jobs.push(
      Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: "Active" }),
        Employee.countDocuments({ status: "On Leave" }),
        Leave.countDocuments({ status: "Pending" }),
      ]).then(([employees, active, onLeave, pendingLeave]) => {
        data.hr = { employees, active, onLeave, pendingLeave };
      })
    );
  }

  if (can("supplyChain")) {
    jobs.push(
      Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ quantity: 0 }),
        Product.countDocuments({ quantity: { $gt: 0 }, $expr: { $lte: ["$quantity", "$reorderLevel"] } }),
        PurchaseOrder.countDocuments({ status: "Pending" }),
      ]).then(([products, outOfStock, lowStock, pendingOrders]) => {
        data.supplyChain = { products, outOfStock, lowStock, pendingOrders };
      })
    );
  }

  if (can("projects")) {
    jobs.push(
      Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: "In Progress" }),
        Project.countDocuments({ status: "Completed" }),
      ]).then(([total, active, completed]) => {
        data.projects = { total, active, completed };
      })
    );
  }

  await Promise.all(jobs);
  return data;
};

module.exports = { summary };
