
import { useState } from "react";

const initialPayables = [
  {
    id: "AP-1001",
    vendor: "Tech Solutions Pvt. Ltd.",
    invoice: "INV-2026-101",
    dueDate: "2026-10-15",
    amount: 45000,
    status: "Pending",
  },
  {
    id: "AP-1002",
    vendor: "Office Supplies Co.",
    invoice: "INV-2026-102",
    dueDate: "2026-10-18",
    amount: 12500,
    status: "Paid",
  },
  {
    id: "AP-1003",
    vendor: "Cloud Services India",
    invoice: "INV-2026-103",
    dueDate: "2026-10-10",
    amount: 28000,
    status: "Overdue",
  },
  {
    id: "AP-1004",
    vendor: "Logistics Express",
    invoice: "INV-2026-104",
    dueDate: "2026-10-22",
    amount: 17500,
    status: "Pending",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Payables = () => {
  const [payables, setPayables] = useState(initialPayables);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayables = payables.filter((item) => {
    const matchesSearch = `${item.vendor} ${item.invoice} ${item.id}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "All" || item.status === statusFilter)
    );
  });

  const totalOutstanding = payables
    .filter((item) => item.status !== "Paid")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPaid = payables
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.amount, 0);

  const overdueCount = payables.filter(
    (item) => item.status === "Overdue"
  ).length;

  const markAsPaid = (id) => {
    setPayables((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: "Paid" } : item
      )
    );
  };

  const summary = [
    {
      title: "Outstanding Payables",
      value: formatCurrency(totalOutstanding),
      color: "text-blue-600",
    },
    {
      title: "Total Paid",
      value: formatCurrency(totalPaid),
      color: "text-emerald-600",
    },
    {
      title: "Overdue Invoices",
      value: overdueCount,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Accounts Payable
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track vendor invoices, outstanding balances, and payments.
          </p>
        </div>
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
          <h2 className="font-semibold text-slate-900">Vendor Invoices</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendors or invoices..."
              aria-label="Search vendor invoices"
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
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPayables.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.vendor}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.invoice}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {item.dueDate}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        item.status === "Paid"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : item.status === "Overdue"
                            ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.status !== "Paid" ? (
                      <button
                        type="button"
                        onClick={() => markAsPaid(item.id)}
                        className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark as paid
                      </button>
                    ) : (
                      <span className="text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredPayables.length === 0 && (
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
          Showing {filteredPayables.length} of {payables.length} sample invoices
        </div>
      </section>
    </div>
  );
};

export default Payables;
