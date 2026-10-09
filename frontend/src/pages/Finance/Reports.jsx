
import React, { useMemo, useState } from "react";

const monthlyData = [
  { month: "May", income: 42000, expenses: 28000 },
  { month: "Jun", income: 48000, expenses: 31000 },
  { month: "Jul", income: 45000, expenses: 29000 },
  { month: "Aug", income: 56000, expenses: 36000 },
  { month: "Sep", income: 52000, expenses: 34000 },
  { month: "Oct", income: 65000, expenses: 39000 },
];

const transactions = [
  { id: "TXN-1001", date: "2026-10-02", description: "Website Development", category: "Income", amount: 12500, status: "Completed" },
  { id: "TXN-1002", date: "2026-10-03", description: "Office Rent", category: "Expense", amount: 8000, status: "Completed" },
  { id: "TXN-1003", date: "2026-10-04", description: "Consulting Services", category: "Income", amount: 9500, status: "Pending" },
  { id: "TXN-1004", date: "2026-10-05", description: "Software Subscription", category: "Expense", amount: 2400, status: "Completed" },
  { id: "TXN-1005", date: "2026-10-06", description: "Product Sales", category: "Income", amount: 15000, status: "Completed" },
  { id: "TXN-1006", date: "2026-10-07", description: "Marketing Campaign", category: "Expense", amount: 5200, status: "Pending" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Reports = () => {
  const [period, setPeriod] = useState("6 months");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesCategory =
        category === "All" || transaction.category === category;

      const matchesSearch =
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.id.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const visibleMonths =
    period === "3 months" ? monthlyData.slice(-3) : monthlyData;

  const totalIncome = visibleMonths.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = visibleMonths.reduce(
    (sum, item) => sum + item.expenses,
    0
  );
  const netProfit = totalIncome - totalExpenses;
  const maxValue = Math.max(
    ...visibleMonths.flatMap((item) => [item.income, item.expenses])
  );

  const exportCSV = () => {
    const headers = ["Transaction ID", "Date", "Description", "Category", "Amount", "Status"];
    const rows = filteredTransactions.map((item) => [
      item.id,
      item.date,
      item.description,
      item.category,
      item.amount,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amdox-finance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">Finance</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review revenue, expenses, and your overall financial performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Report
          </button>
          <button
            onClick={exportCSV}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Report Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a period to update the financial summary.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option>3 months</option>
          <option>6 months</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(totalIncome)}
          </p>
          <p className="mt-2 text-xs text-emerald-600">Income for selected period</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="mt-2 text-xs text-rose-600">Expenses for selected period</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Net Profit</p>
          <p className={`mt-3 text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Revenue minus expenses</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Profit Margin</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalIncome ? `${((netProfit / totalIncome) * 100).toFixed(1)}%` : "0%"}
          </p>
          <p className="mt-2 text-xs text-slate-500">Net profit as a share of revenue</p>
        </div>
      </div>

      {/* Revenue and expenses chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Revenue vs. Expenses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monthly comparison for the selected period.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-3 w-3 rounded-sm bg-indigo-500" />
            Revenue
          </span>
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-3 w-3 rounded-sm bg-amber-400" />
            Expenses
          </span>
        </div>

        <div className="flex h-64 items-end gap-3 border-b border-slate-200 pb-2 sm:gap-6">
          {visibleMonths.map((item) => (
            <div key={item.month} className="flex h-full min-w-0 flex-1 items-end justify-center gap-1 sm:gap-2">
              <div
                title={`Revenue: ${formatCurrency(item.income)}`}
                className="w-1/2 max-w-12 rounded-t-md bg-indigo-500 transition-all hover:bg-indigo-600"
                style={{ height: `${(item.income / maxValue) * 85}%` }}
              />
              <div
                title={`Expenses: ${formatCurrency(item.expenses)}`}
                className="w-1/2 max-w-12 rounded-t-md bg-amber-400 transition-all hover:bg-amber-500"
                style={{ height: `${(item.expenses / maxValue) * 85}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-3 sm:gap-6">
          {visibleMonths.map((item) => (
            <p key={item.month} className="min-w-0 flex-1 text-center text-xs text-slate-500">
              {item.month}
            </p>
          ))}
        </div>
      </div>

      {/* Transaction report */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Transaction Report
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and filter recorded transactions.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option>All</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Transaction", "Date", "Description", "Category", "Amount", "Status"].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-indigo-600">
                    {item.id}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-800">
                    {item.description}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.category === "Income" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                    No transactions match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Demo data only. Reports will use actual company records after backend integration.
      </p>
    </div>
  );
};

export default Reports;
