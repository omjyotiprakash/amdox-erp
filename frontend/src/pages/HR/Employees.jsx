import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee,
} from "../../services/hrService";
import { localToday } from "../../utils/dateUtils";

const statusClass = {
  Active: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
  "On Leave": "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
  Inactive: "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600",
};

const employeeFields = [
  { name: "name", label: "Full name", placeholder: "e.g. Aarav Sharma" },
  { name: "email", label: "Work email", type: "email", placeholder: "name@company.com" },
  { name: "department", label: "Department", placeholder: "e.g. Engineering" },
  { name: "jobTitle", label: "Role", placeholder: "e.g. Software Engineer" },
  { name: "joinedOn", label: "Date joined", type: "date" },
  { name: "basicSalary", label: "Monthly basic salary (INR)", type: "number", min: "0" },
  { name: "deductions", label: "Monthly deductions (INR)", type: "number", min: "0" },
  { name: "status", label: "Status", type: "select", options: ["Active", "On Leave", "Inactive"] },
];

const Employees = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(null); // null | { employee? }
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, departmentFilter, statusFilter]);
  const { data, loading, error, reload } = useFetch(
    () =>
      fetchEmployees({
        search: debouncedSearch,
        department: departmentFilter,
        status: statusFilter,
        page,
      }),
    [debouncedSearch, departmentFilter, statusFilter, page]
  );

  const employees = data?.items ?? [];
  const departments = ["All", ...(data?.departments ?? [])];
  const totals = data?.summary ?? { total: 0, active: 0, onLeave: 0 };

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = (employee) => {
    if (!window.confirm(`Delete ${employee.name} (${employee.code})?`)) return;
    runAction(() => deleteEmployee(employee.id));
  };

  const summary = [
    { title: "Total Employees", value: totals.total, color: "text-blue-600" },
    { title: "Active Employees", value: totals.active, color: "text-emerald-600" },
    { title: "On Leave", value: totals.onLeave, color: "text-amber-600" },
  ];

  const editing = form?.employee;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            View employees, departments, roles, and employment status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({})}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add Employee
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Print Directory
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">All Employees</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search employees"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Filter by department"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "All" ? "All departments" : department}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by employee status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Date Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{employee.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{employee.email}</p>
                    <p className="mt-1 text-xs text-slate-400">{employee.code}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{employee.department}</td>
                  <td className="px-5 py-4 text-slate-600">{employee.jobTitle}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {employee.joinedOn}
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusClass[employee.status]}>{employee.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setForm({ employee })}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(employee)}
                      className="ml-4 font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading employees..."
                      : data?.total
                        ? "No employees match your search or filters."
                        : "No employees yet. Click Add Employee to create the first one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {employees.length} of {data?.total ?? 0} employees
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>

      {form && (
        <FormModal
          title={editing ? `Edit ${editing.name}` : "Add Employee"}
          submitLabel={editing ? "Save Changes" : "Add Employee"}
          fields={employeeFields}
          initialValues={editing ?? { joinedOn: localToday(), basicSalary: "0", deductions: "0" }}
          onSubmit={async (values) => {
            if (editing) await updateEmployee(editing.id, values);
            else await createEmployee(values);
            reload();
          }}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
};

export default Employees;
