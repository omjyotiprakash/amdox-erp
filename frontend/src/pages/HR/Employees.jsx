
import { useState } from "react";

const initialEmployees = [
  {
    id: "EMP-1001",
    name: "Aarav Sharma",
    email: "aarav@amdox.com",
    department: "Engineering",
    role: "Software Engineer",
    joined: "2025-02-10",
    status: "Active",
  },
  {
    id: "EMP-1002",
    name: "Priya Patel",
    email: "priya@amdox.com",
    department: "Human Resources",
    role: "HR Manager",
    joined: "2024-11-18",
    status: "Active",
  },
  {
    id: "EMP-1003",
    name: "Rohan Das",
    email: "rohan@amdox.com",
    department: "Finance",
    role: "Accountant",
    joined: "2025-05-06",
    status: "On Leave",
  },
  {
    id: "EMP-1004",
    name: "Ananya Singh",
    email: "ananya@amdox.com",
    department: "Marketing",
    role: "Marketing Executive",
    joined: "2026-01-12",
    status: "Active",
  },
  {
    id: "EMP-1005",
    name: "Vikram Rao",
    email: "vikram@amdox.com",
    department: "Engineering",
    role: "Frontend Developer",
    joined: "2025-08-21",
    status: "Inactive",
  },
];

const Employees = () => {
  const [employees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = [
      employee.name,
      employee.email,
      employee.id,
      employee.role,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" ||
      employee.department === departmentFilter;

    const matchesStatus =
      statusFilter === "All" || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeaveCount = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const departments = [
    "All",
    ...new Set(employees.map((employee) => employee.department)),
  ];

  const summary = [
    {
      title: "Total Employees",
      value: employees.length,
      color: "text-blue-600",
    },
    {
      title: "Active Employees",
      value: activeCount,
      color: "text-emerald-600",
    },
    {
      title: "On Leave",
      value: onLeaveCount,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employee Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View employees, departments, roles, and employment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Print Directory
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
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {employee.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {employee.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {employee.id}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {employee.department}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{employee.role}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {employee.joined}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        employee.status === "Active"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : employee.status === "On Leave"
                            ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No employees match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredEmployees.length} of {employees.length} sample employees
        </div>
      </section>
    </div>
  );
};

export default Employees;
