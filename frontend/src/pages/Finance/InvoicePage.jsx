import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { useConfirm } from "../../context/ConfirmContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

const statusClass = {
  Paid: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
  Overdue: "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700",
  Pending: "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
};

// Shared screen for Accounts Payable and Accounts Receivable.
// `config` supplies the wording and the API functions for one direction.
const InvoicePage = ({ config }) => {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, statusFilter]);
  const { data, loading, error, reload } = useFetch(
    () => config.fetchAll({ search: debouncedSearch, status: statusFilter, page }),
    [debouncedSearch, statusFilter, page]
  );

  const invoices = data?.items ?? [];
  const totals = data?.summary ?? { outstanding: 0, paid: 0, overdueCount: 0 };

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handlePay = (invoice) => runAction(() => config.pay(invoice.id));

  const handleDelete = async (invoice) => {
    if (!(await confirm({ title: "Delete invoice?", message: `Delete ${invoice.code} (${invoice.invoiceNumber})? This cannot be undone.`, confirmLabel: "Delete", danger: true }))) return;
    runAction(() => config.remove(invoice.id));
  };

  const summary = [
    { title: config.outstandingTitle, value: formatCurrency(totals.outstanding), color: "text-blue-600" },
    { title: config.paidTitle, value: formatCurrency(totals.paid), color: "text-emerald-600" },
    { title: "Overdue Invoices", value: totals.overdueCount, color: "text-red-600" },
  ];

  const formFields = [
    { name: "party", label: config.partyLabel, placeholder: config.partyPlaceholder },
    { name: "invoiceNumber", label: "Invoice number", placeholder: "e.g. INV-2026-105" },
    { name: "dueDate", label: "Due date", type: "date" },
    { name: "amount", label: "Amount (INR)", type: "number" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {config.addLabel}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Invoices
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summary.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className={`mt-3 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">{config.listTitle}</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={config.searchPlaceholder}
              aria-label={config.searchPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter invoices by status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">{config.partyColumn}</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{invoice.party}</p>
                    <p className="mt-1 text-xs text-slate-500">{invoice.code}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{invoice.invoiceNumber}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {invoice.dueDate}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusClass[invoice.status]}>{invoice.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {invoice.status !== "Paid" ? (
                      <button
                        type="button"
                        onClick={() => handlePay(invoice)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {config.payLabel}
                      </button>
                    ) : (
                      <span className="text-slate-400">Completed</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(invoice)}
                      className="ml-4 font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading invoices..."
                      : data?.total
                        ? "No invoices match your search."
                        : config.emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {invoices.length} of {data?.total ?? 0} invoices
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>

      {showForm && (
        <FormModal
          title={config.addLabel}
          submitLabel={config.addLabel}
          fields={formFields}
          onSubmit={async (values) => {
            await config.create(values);
            reload();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default InvoicePage;
