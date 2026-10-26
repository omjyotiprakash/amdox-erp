import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { createLeave, decideLeave, deleteLeave, fetchEmployees, fetchLeave } from "../../services/hrService";
import { localToday } from "../../utils/dateUtils";

const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Annual Leave", "Unpaid Leave"];

const statusClass = {
  Approved: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
  Rejected: "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700",
  Pending: "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
};

const Leave = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchLeave({ search: debouncedSearch, status: statusFilter }),
    [debouncedSearch, statusFilter]
  );
  const { data: employeeData } = useFetch(() => fetchEmployees({}), []);

  const requests = data?.items ?? [];
  const totals = data?.summary ?? { total: 0, pending: 0, approved: 0, approvedDays: 0 };

  const employeeOptions = (employeeData?.items ?? [])
    .filter((employee) => employee.status !== "Inactive")
    .map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.code})` }));

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = (request) => {
    if (!window.confirm(`Delete leave request ${request.code}?`)) return;
    runAction(() => deleteLeave(request.id));
  };

  const summary = [
    { title: "Total Requests", value: totals.total, color: "text-blue-600" },
    { title: "Pending Approval", value: totals.pending, color: "text-amber-600" },
    { title: "Approved Requests", value: totals.approved, color: "text-emerald-600" },
    { title: "Approved Leave Days", value: totals.approvedDays, color: "text-slate-900" },
  ];

  const formFields = [
    { name: "employeeId", label: "Employee", type: "select", options: employeeOptions },
    { name: "type", label: "Leave type", type: "select", options: LEAVE_TYPES },
    { name: "from", label: "From", type: "date" },
    { name: "to", label: "To", type: "date" },
    { name: "reason", label: "Reason (optional)", optional: true, placeholder: "e.g. Family function" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review leave requests and manage approval status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={employeeOptions.length === 0}
            title={employeeOptions.length === 0 ? "Add an employee first" : undefined}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            New Leave Request
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Requests
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>{item.value}</p>
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
              placeholder="Search leave requests..."
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
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{request.employee?.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.employee?.department} · {request.code}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {request.type}
                    {request.reason && (
                      <p className="mt-1 text-xs text-slate-400">{request.reason}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {request.from} to {request.to}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{request.days}</td>
                  <td className="px-5 py-4">
                    <span className={statusClass[request.status]}>{request.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {request.status === "Pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => runAction(() => decideLeave(request.id, "Approved"))}
                          className="font-medium text-emerald-600 hover:text-emerald-800"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => runAction(() => decideLeave(request.id, "Rejected"))}
                          className="ml-3 font-medium text-red-600 hover:text-red-800"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(request)}
                          className="ml-3 font-medium text-slate-500 hover:text-slate-800"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading leave requests..."
                      : data?.total
                        ? "No leave requests match your search."
                        : "No leave requests yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {requests.length} of {data?.total ?? 0} requests
        </div>
      </section>

      {showForm && (
        <FormModal
          title="New Leave Request"
          submitLabel="Submit Request"
          fields={formFields}
          initialValues={{ from: localToday(), to: localToday() }}
          onSubmit={async (values) => {
            await createLeave(values);
            reload();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Leave;
