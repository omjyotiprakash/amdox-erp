
import { useState } from "react";

const transactions = [
  {
    id: "TXN-1001",
    date: "2026-10-01",
    description: "Office rent",
    account: "Rent Expense",
    type: "Expense",
    amount: 25000,
    status: "Posted",
  },
  {
    id: "TXN-1002",
    date: "2026-10-03",
    description: "Client payment",
    account: "Accounts Receivable",
    type: "Income",
    amount: 65000,
    status: "Posted",
  },
  {
    id: "TXN-1003",
    date: "2026-10-05",
    description: "Software subscription",
    account: "Software Expense",
    type: "Expense",
    amount: 4500,
    status: "Pending",
  },
  {
    id: "TXN-1004",
    date: "2026-10-07",
    description: "Product sales",
    account: "Sales Revenue",
    type: "Income",
    amount: 42000,
    status: "Posted",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Ledger = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = [
      transaction.id,
      transaction.description,
      transaction.account,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || transaction.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const summaryCards = [
    { title: "Total Income", amount: totalIncome, color: "text-emerald-600" },
    { title: "Total Expenses", amount: totalExpenses, color: "text-red-600" },
    {
      title: "Net Balance",
      amount: totalIncome - totalExpenses,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            General Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and search your financial transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Ledger
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className={`mt-3 text-2xl font-bold ${card.color}`}>
              {formatCurrency(card.amount)}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Transactions</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              aria-label="Search transactions"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by transaction type"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {transaction.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.id}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {transaction.date}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {transaction.account}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        transaction.type === "Income"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {transaction.status}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No transactions match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredTransactions.length} of {transactions.length} sample
          transactions
        </div>
      </section>
    </div>
  );
};

export default Ledger;
