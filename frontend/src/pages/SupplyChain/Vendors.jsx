
import { useState } from "react";

const initialVendors = [
  {
    id: "VEN-1001",
    name: "TechSource India",
    category: "Electronics",
    contact: "Rahul Sharma",
    email: "rahul@techsource.example",
    phone: "+91 98765 43210",
    location: "Bhubaneswar",
    status: "Active",
  },
  {
    id: "VEN-1002",
    name: "Office Essentials",
    category: "Furniture",
    contact: "Priya Das",
    email: "priya@officeessentials.example",
    phone: "+91 98765 12345",
    location: "Cuttack",
    status: "Active",
  },
  {
    id: "VEN-1003",
    name: "Digital Components Co.",
    category: "Electronics",
    contact: "Amit Kumar",
    email: "amit@digitalcomponents.example",
    phone: "+91 91234 56780",
    location: "Kolkata",
    status: "Inactive",
  },
  {
    id: "VEN-1004",
    name: "Workspace Solutions",
    category: "Office Supplies",
    contact: "Sneha Patel",
    email: "sneha@workspace.example",
    phone: "+91 99887 66554",
    location: "Bengaluru",
    status: "Active",
  },
  {
    id: "VEN-1005",
    name: "Global Packaging",
    category: "Packaging",
    contact: "Arjun Singh",
    email: "arjun@globalpackaging.example",
    phone: "+91 90909 80808",
    location: "Hyderabad",
    status: "Pending",
  },
];

const Vendors = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const activeCount = vendors.filter(
    (vendor) => vendor.status === "Active"
  ).length;

  const pendingCount = vendors.filter(
    (vendor) => vendor.status === "Pending"
  ).length;

  const inactiveCount = vendors.filter(
    (vendor) => vendor.status === "Inactive"
  ).length;

  const filteredVendors = vendors.filter((vendor) => {
    const searchText = [
      vendor.name,
      vendor.id,
      vendor.contact,
      vendor.email,
      vendor.location,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || vendor.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || vendor.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const updateStatus = (id, status) => {
    setVendors((previous) =>
      previous.map((vendor) =>
        vendor.id === id ? { ...vendor, status } : vendor
      )
    );
  };

  const summary = [
    {
      title: "Total Vendors",
      value: vendors.length,
      color: "text-blue-600",
    },
    {
      title: "Active Vendors",
      value: activeCount,
      color: "text-emerald-600",
    },
    {
      title: "Pending Approval",
      value: pendingCount,
      color: "text-amber-600",
    },
    {
      title: "Inactive Vendors",
      value: inactiveCount,
      color: "text-red-600",
    },
  ];

  const statusStyle = (status) => {
    if (status === "Active") {
      return "bg-emerald-50 text-emerald-700";
    }
    if (status === "Pending") {
      return "bg-amber-50 text-amber-700";
    }
    return "bg-red-50 text-red-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage supplier information, contact details, and vendor status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Vendors
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Vendor Directory</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendors, contact, email..."
              aria-label="Search vendors"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Packaging">Packaging</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
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
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {vendor.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {vendor.id}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {vendor.contact}
                  </td>

                  <td className="px-5 py-4">
                    <a
                      href={`mailto:${vendor.email}`}
                      className="block text-blue-600 hover:underline"
                    >
                      {vendor.email}
                    </a>
                    <a
                      href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                      className="mt-1 block whitespace-nowrap text-xs text-slate-500 hover:text-blue-600"
                    >
                      {vendor.phone}
                    </a>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {vendor.category}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {vendor.location}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(
                        vendor.status
                      )}`}
                    >
                      {vendor.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={vendor.status}
                      onChange={(event) =>
                        updateStatus(vendor.id, event.target.value)
                      }
                      aria-label={`Change status for ${vendor.name}`}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredVendors.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No vendors match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredVendors.length} of {vendors.length} sample vendors
        </div>
      </section>
    </div>
  );
};

export default Vendors;
