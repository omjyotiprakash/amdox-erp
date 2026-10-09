
import { useState } from "react";

const initialRequests = [
  {
    id: "LV-1001",
    employee: "Aarav Sharma",
    department: "Engineering",
    type: "Casual Leave",
    from: "2026-10-12",
    to: "2026-10-13",
    days: 2,
    status: "Pending",
  },
  {
    id: "LV-1002",
    employee: "Priya Patel",
    department: "Human Resources",
    type: "Sick Leave",
    from: "2026-10-08",
    to: "2026-10-09",
    days: 2,
    status: "Approved",
  },
  {
    id: "LV-1003",
    employee: "Rohan Das",
    department: "Finance",
    type: "Annual Leave",
    from: "2026-10-15",
    to: "2026-10-19",
    days: 5,
    status: "Pending",
  },
  {
    id: "LV-1004",
    employee: "Ananya Singh",
    department: "Marketing",
    type: "Casual Leave",
    from: "2026-10-05",
    to: "2026-10-06",
    days: 2,
    status: "Rejected",
  },
];

const Leave = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = `${request.employee} ${request.department} ${request.id} ${request.type}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "All" || request.status === statusFilter)
    );
  });

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const totalDaysApproved = requests
    .filter((request) => request.status === "Approved")
    .reduce((total, request) => total + request.days, 0);

  const updateStatus = (id, status) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  const summary = [
    {
      title: "Total Requests",
      value: requests.length,
      color: "text-blue-600",
    },
    {
      title: "Pending Approval",
      value: pendingCount,
      color: "text-amber-600",
    },
    {
      title: "Approved Requests",
      value: approvedCount,
      color: "text-emerald-600",
    },
    {
      title: "Approved Leave Days",
      value: totalDaysApproved,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leave Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review leave requests and manage employee time off.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Requests
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Leave Requests</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search leave requests"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter leave requests by status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {request.employee}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.department} · {request.id}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{request.type}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {request.from} – {request.to}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{request.days}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        request.status === "Approved"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : request.status === "Rejected"
                            ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {request.status === "Pending" ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => updateStatus(request.id, "Approved")}
                          className="font-medium text-emerald-600 hover:text-emerald-800"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(request.id, "Rejected")}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No leave requests match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredRequests.length} of {requests.length} sample requests
        </div>
      </section>
    </div>
  );
};

export default Leave;
