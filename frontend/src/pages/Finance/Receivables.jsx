
import { useState } from "react";

const initialReceivables = [
  {
    id: "AR-1001",
    customer: "Acme Technologies",
    invoice: "INV-2026-201",
    dueDate: "2026-10-12",
    amount: 85000,
    status: "Pending",
  },
  {
    id: "AR-1002",
    customer: "Bright Future Ltd.",
    invoice: "INV-2026-202",
    dueDate: "2026-10-18",
    amount: 42000,
    status: "Paid",
  },
  {
    id: "AR-1003",
    customer: "Global Trade Corp.",
    invoice: "INV-2026-203",
    dueDate: "2026-10-05",
    amount: 31000,
    status: "Overdue",
  },
  {
    id: "AR-1004",
    customer: "NextGen Systems",
    invoice: "INV-2026-204",
    dueDate: "2026-10-25",
    amount: 56000,
    status: "Pending",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Receivables = () => {
  const [invoices, setInvoices] = useState(initialReceivables);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = `${invoice.customer} ${invoice.invoice} ${invoice.id}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "All" || invoice.status === statusFilter)
    );
  });

  const outstanding = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const received = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const overdue = invoices.filter(
    (invoice) => invoice.status === "Overdue"
  ).length;

  const markAsPaid = (id) => {
    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === id ? { ...invoice, status: "Paid" } : invoice
      )
    );
  };

  const summary = [
    {
      title: "Outstanding Receivables",
      value: formatCurrency(outstanding),
      color: "text-blue-600",
    },
    {
      title: "Payments Received",
      value: formatCurrency(received),
      color: "text-emerald-600",
    },
    {
      title: "Overdue Invoices",
      value: overdue,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Accounts Receivable
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track customer invoices, incoming payments, and outstanding balances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Invoices
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summary.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className={`mt-3 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Customer Invoices</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers or invoices..."
              aria-label="Search customer invoices"
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
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {invoice.customer}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{invoice.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {invoice.invoice}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {invoice.dueDate}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        invoice.status === "Paid"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : invoice.status === "Overdue"
                            ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {invoice.status !== "Paid" ? (
                      <button
                        type="button"
                        onClick={() => markAsPaid(invoice.id)}
                        className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800"
                      >
                        Record payment
                      </button>
                    ) : (
                      <span className="text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No invoices match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredInvoices.length} of {invoices.length} sample invoices
        </div>
      </section>
    </div>
  );
};

export default Receivables;
