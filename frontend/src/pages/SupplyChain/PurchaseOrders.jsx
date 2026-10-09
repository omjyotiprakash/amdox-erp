
import { useState } from "react";

const initialOrders = [
  {
    id: "PO-2026-001",
    vendor: "TechSource India",
    date: "2026-10-02",
    deliveryDate: "2026-10-15",
    items: 12,
    amount: 185000,
    status: "Approved",
  },
  {
    id: "PO-2026-002",
    vendor: "Office Essentials",
    date: "2026-10-04",
    deliveryDate: "2026-10-18",
    items: 8,
    amount: 72000,
    status: "Pending",
  },
  {
    id: "PO-2026-003",
    vendor: "Digital Components Co.",
    date: "2026-10-05",
    deliveryDate: "2026-10-12",
    items: 20,
    amount: 95000,
    status: "Delivered",
  },
  {
    id: "PO-2026-004",
    vendor: "Workspace Solutions",
    date: "2026-10-06",
    deliveryDate: "2026-10-20",
    items: 15,
    amount: 54000,
    status: "Ordered",
  },
  {
    id: "PO-2026-005",
    vendor: "Global Packaging",
    date: "2026-10-08",
    deliveryDate: "2026-10-25",
    items: 30,
    amount: 38000,
    status: "Cancelled",
  },
  {
    id: "PO-2026-006",
    vendor: "TechSource India",
    date: "2026-10-09",
    deliveryDate: "2026-10-22",
    items: 10,
    amount: 125000,
    status: "Pending",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-blue-50 text-blue-700",
  Ordered: "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");

  const totalValue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.amount, 0);

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const approvedCount = orders.filter(
    (order) => order.status === "Approved"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const vendors = [...new Set(orders.map((order) => order.vendor))];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.vendor}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    const matchesVendor =
      vendorFilter === "All" || order.vendor === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

  const updateStatus = (id, status) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const summary = [
    {
      title: "Total Purchase Orders",
      value: orders.length,
      color: "text-blue-600",
    },
    {
      title: "Total Order Value",
      value: formatCurrency(totalValue),
      color: "text-violet-600",
    },
    {
      title: "Awaiting Approval",
      value: pendingCount,
      color: "text-amber-600",
    },
    {
      title: "Delivered Orders",
      value: deliveredCount,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Purchase Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track supplier orders, approvals, and expected deliveries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Orders
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved Orders</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Order Value</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(
              orders
                .filter(
                  (order) =>
                    order.status !== "Cancelled" &&
                    order.status !== "Delivered"
                )
                .reduce((sum, order) => sum + order.amount, 0)
            )}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Purchase Order Register
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order ID or vendor..."
              aria-label="Search purchase orders"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by order status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Ordered">Ordered</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={vendorFilter}
              onChange={(event) => setVendorFilter(event.target.value)}
              aria-label="Filter by vendor"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Order Date</th>
                <th className="px-5 py-3">Expected Delivery</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Update Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-blue-600">
                    {order.id}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {order.vendor}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDate(order.date)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDate(order.deliveryDate)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {order.items}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                    {formatCurrency(order.amount)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateStatus(order.id, event.target.value)
                      }
                      aria-label={`Update status for ${order.id}`}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No purchase orders match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredOrders.length} of {orders.length} sample orders
        </div>
      </section>
    </div>
  );
};

export default PurchaseOrders;
