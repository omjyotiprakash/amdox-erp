import React, { useMemo, useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useFetch } from "../../hooks/useFetch";
import { fetchFinanceReport } from "../../services/financeService";

const PERIODS = { "3 months": 3, "6 months": 6, "12 months": 12 };

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

  const { data, loading, error, reload } = useFetch(
    () => fetchFinanceReport(PERIODS[period]),
    [period]
  );

  const visibleMonths = useMemo(() => data?.months ?? [], [data]);
  const transactions = useMemo(() => data?.transactions ?? [], [data]);

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase();
    return transactions.filter((transaction) => {
      const matchesCategory = category === "All" || transaction.type === category;
      const matchesSearch =
        transaction.description.toLowerCase().includes(term) ||
        transaction.code.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [transactions, category, search]);

  const totalIncome = data?.totals.income ?? 0;
  const totalExpenses = data?.totals.expenses ?? 0;
  const netProfit = data?.totals.net ?? 0;
  const maxValue = Math.max(
    1,
    ...visibleMonths.flatMap((item) => [item.income, item.expenses])
  );

  const exportCSV = () => {
    const headers = ["Transaction ID", "Date", "Description", "Category", "Amount", "Status"];
    const rows = filteredTransactions.map((item) => [
      item.code,
      item.date,
      item.description,
      item.type,
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

      <ErrorBanner message={error} onRetry={reload} />

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
          <option>12 months</option>
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
            <div key={`${item.year}-${item.month}`} className="flex h-full min-w-0 flex-1 items-end justify-center gap-1 sm:gap-2">
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
            <p key={`${item.year}-${item.month}`} className="min-w-0 flex-1 text-center text-xs text-slate-500">
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
                    {item.code}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-800">
                    {item.description}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.type === "Income" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "Posted" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading transactions..."
                      : transactions.length
                        ? "No transactions match your search."
                        : "No transactions in this period."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
          Showing {filteredTransactions.length} of {transactions.length} transactions in this period
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Totals and the chart include Posted transactions only; Pending ones are listed but not counted.
      </p>
    </div>
  );
};

export default Reports;
