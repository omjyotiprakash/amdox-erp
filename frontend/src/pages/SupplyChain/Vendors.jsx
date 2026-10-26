import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { createVendor, deleteVendor, fetchVendors, updateVendor } from "../../services/supplyChainService";

const statusStyle = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const vendorFields = [
  { name: "name", label: "Vendor name", placeholder: "e.g. TechSource India" },
  { name: "category", label: "Category", placeholder: "e.g. Electronics" },
  { name: "contact", label: "Contact person", placeholder: "e.g. Rahul Sharma" },
  { name: "email", label: "Email", type: "email", placeholder: "name@vendor.com" },
  { name: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { name: "location", label: "Location", placeholder: "e.g. Bhubaneswar" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Pending", "Inactive"] },
];

const Vendors = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(null); // null | { vendor? }
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, categoryFilter, statusFilter]);
  const { data, loading, error, reload } = useFetch(
    () => fetchVendors({ search: debouncedSearch, category: categoryFilter, status: statusFilter, page }),
    [debouncedSearch, categoryFilter, statusFilter, page]
  );

  const vendors = data?.items ?? [];
  const totals = data?.summary ?? { total: 0, active: 0, pending: 0, inactive: 0 };
  const categories = data?.categories ?? [];

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = (vendor) => {
    if (!window.confirm(`Delete ${vendor.name} (${vendor.code})?`)) return;
    runAction(() => deleteVendor(vendor.id));
  };

  const summary = [
    { title: "Total Vendors", value: totals.total, color: "text-blue-600" },
    { title: "Active Vendors", value: totals.active, color: "text-emerald-600" },
    { title: "Pending Approval", value: totals.pending, color: "text-amber-600" },
    { title: "Inactive Vendors", value: totals.inactive, color: "text-slate-600" },
  ];

  const editing = form?.vendor;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage supplier information, contact details, and vendor status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({})}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Vendor
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Vendors
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
          <h2 className="font-semibold text-slate-900">Vendor Directory</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendors, contacts, location..."
              aria-label="Search vendors"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter vendors by category"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter vendors by status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Contact Person</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{vendor.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{vendor.code}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{vendor.contact}</td>
                  <td className="px-5 py-4">
                    <a href={`mailto:${vendor.email}`} className="block text-blue-600 hover:underline">
                      {vendor.email}
                    </a>
                    <a
                      href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                      className="mt-1 block text-xs text-slate-500 hover:underline"
                    >
                      {vendor.phone}
                    </a>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{vendor.category}</td>
                  <td className="px-5 py-4 text-slate-600">{vendor.location}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[vendor.status]}`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <select
                      value={vendor.status}
                      onChange={(event) => runAction(() => updateVendor(vendor.id, { status: event.target.value }))}
                      aria-label={`Update ${vendor.name} status`}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setForm({ vendor })}
                      className="ml-3 font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vendor)}
                      className="ml-3 font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {vendors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading vendors..."
                      : data?.total
                        ? "No vendors match your search or filters."
                        : "No vendors yet. Click Add Vendor to create the first one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {vendors.length} of {data?.total ?? 0} vendors
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>

      {form && (
        <FormModal
          title={editing ? `Edit ${editing.name}` : "Add Vendor"}
          submitLabel={editing ? "Save Changes" : "Add Vendor"}
          fields={vendorFields}
          initialValues={editing ?? { status: "Active" }}
          onSubmit={async (values) => {
            if (editing) await updateVendor(editing.id, values);
            else await createVendor(values);
            reload();
          }}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
};

export default Vendors;
