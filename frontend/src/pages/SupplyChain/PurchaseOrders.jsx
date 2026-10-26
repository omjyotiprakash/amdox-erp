import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  fetchPurchaseOrders,
  fetchVendors,
  setPurchaseOrderStatus,
} from "../../services/supplyChainService";
import { localToday } from "../../utils/dateUtils";
import { formatCurrency, formatDate } from "../../utils/formatters";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-blue-50 text-blue-700",
  Ordered: "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

// Mirrors the server: where an order may go next. Delivered and Cancelled are final.
const NEXT_STATUSES = {
  Pending: ["Approved", "Cancelled"],
  Approved: ["Ordered", "Cancelled"],
  Ordered: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const PurchaseOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, statusFilter, vendorFilter]);
  const { data, loading, error, reload } = useFetch(
    () => fetchPurchaseOrders({ search: debouncedSearch, status: statusFilter, vendorId: vendorFilter, page }),
    [debouncedSearch, statusFilter, vendorFilter, page]
  );
  const { data: vendorData } = useFetch(() => fetchVendors({ limit: 200 }), []);

  const orders = data?.items ?? [];
  const totals = data?.summary ?? { total: 0, totalValue: 0, pending: 0, delivered: 0 };
  const allVendors = vendorData?.items ?? [];
  const activeVendorOptions = allVendors
    .filter((vendor) => vendor.status === "Active")
    .map((vendor) => ({ value: vendor.id, label: vendor.name }));

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = (order) => {
    if (!window.confirm(`Delete purchase order ${order.code}?`)) return;
    runAction(() => deletePurchaseOrder(order.id));
  };

  const summary = [
    { title: "Total Purchase Orders", value: totals.total, color: "text-blue-600" },
    { title: "Total Order Value", value: formatCurrency(totals.totalValue), color: "text-emerald-600" },
    { title: "Awaiting Approval", value: totals.pending, color: "text-amber-600" },
    { title: "Delivered Orders", value: totals.delivered, color: "text-violet-600" },
  ];

  const formFields = [
    { name: "vendorId", label: "Vendor", type: "select", options: activeVendorOptions },
    { name: "orderDate", label: "Order date", type: "date" },
    { name: "deliveryDate", label: "Expected delivery", type: "date" },
    { name: "items", label: "Number of items", type: "number", step: "1", min: "1" },
    { name: "amount", label: "Order amount (INR)", type: "number" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track vendor orders, delivery dates, and order status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={activeVendorOptions.length === 0}
            title={activeVendorOptions.length === 0 ? "Add an Active vendor first" : undefined}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            New Purchase Order
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Orders
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className={`mt-3 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Order Directory</h2>

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
              aria-label="Filter orders by status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              {Object.keys(NEXT_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={vendorFilter}
              onChange={(event) => setVendorFilter(event.target.value)}
              aria-label="Filter orders by vendor"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All vendors</option>
              {allVendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">{order.code}</td>
                  <td className="px-5 py-4 text-slate-600">{order.vendor?.name}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(order.orderDate)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(order.deliveryDate)}</td>
                  <td className="px-5 py-4 text-slate-600">{order.items}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {NEXT_STATUSES[order.status].length > 0 ? (
                      <select
                        value=""
                        onChange={(event) =>
                          event.target.value &&
                          runAction(() => setPurchaseOrderStatus(order.id, event.target.value))
                        }
                        aria-label={`Update ${order.code} status`}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                      >
                        <option value="">Move to...</option>
                        {NEXT_STATUSES[order.status].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">Final</span>
                    )}
                    {order.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        className="ml-3 font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading purchase orders..."
                      : data?.total
                        ? "No purchase orders match your search or filters."
                        : "No purchase orders yet. Add an Active vendor, then create the first order."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {orders.length} of {data?.total ?? 0} purchase orders. Cancelled orders are not counted in the total value.
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>

      {showForm && (
        <FormModal
          title="New Purchase Order"
          submitLabel="Create Order"
          fields={formFields}
          initialValues={{ orderDate: localToday(), deliveryDate: localToday(), items: "1" }}
          onSubmit={async (values) => {
            await createPurchaseOrder(values);
            reload();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;
