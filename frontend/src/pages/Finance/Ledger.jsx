import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { createTransaction, deleteTransaction, fetchLedger } from "../../services/financeService";
import { localToday } from "../../utils/dateUtils";
import { useConfirm } from "../../context/ConfirmContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

const formFields = [
  { name: "date", label: "Date", type: "date" },
  { name: "description", label: "Description", placeholder: "e.g. Office rent" },
  { name: "account", label: "Account", placeholder: "e.g. Rent Expense" },
  { name: "type", label: "Type", type: "select", options: ["Income", "Expense"] },
  { name: "amount", label: "Amount (INR)", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["Posted", "Pending"] },
];

const Ledger = () => {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, typeFilter]);
  const { data, loading, error, reload } = useFetch(
    () => fetchLedger({ search: debouncedSearch, type: typeFilter, page }),
    [debouncedSearch, typeFilter, page]
  );

  const transactions = data?.items ?? [];
  const summary = data?.summary ?? { income: 0, expenses: 0, net: 0 };

  const handleDelete = async (transaction) => {
    if (!(await confirm({ title: "Delete transaction?", message: `Delete ${transaction.code} (${transaction.description})? This cannot be undone.`, confirmLabel: "Delete", danger: true }))) return;
    setActionError("");
    try {
      await deleteTransaction(transaction.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const summaryCards = [
    { title: "Total Income", amount: summary.income, color: "text-emerald-600" },
    { title: "Total Expenses", amount: summary.expenses, color: "text-red-600" },
    { title: "Net Balance", amount: summary.net, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">General Ledger</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and search your financial transactions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Transaction
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Ledger
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

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
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {transaction.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.code}
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
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(transaction)}
                      className="whitespace-nowrap font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    {loading
                      ? "Loading transactions..."
                      : data?.total
                        ? "No transactions match your search."
                        : "No transactions yet. Click Add Transaction to create the first one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {transactions.length} of {data?.total ?? 0} transactions. Totals
          include Posted transactions only.
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>

      {showForm && (
        <FormModal
          title="Add Transaction"
          submitLabel="Add Transaction"
          fields={formFields}
          initialValues={{ date: localToday() }}
          onSubmit={async (values) => {
            await createTransaction(values);
            reload();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Ledger;
