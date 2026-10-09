
import { useState } from "react";

const initialPayroll = [
  {
    id: "PAY-1001",
    employeeId: "EMP-1001",
    name: "Aarav Sharma",
    department: "Engineering",
    basicSalary: 65000,
    deductions: 5000,
    netSalary: 60000,
    status: "Paid",
  },
  {
    id: "PAY-1002",
    employeeId: "EMP-1002",
    name: "Priya Patel",
    department: "Human Resources",
    basicSalary: 58000,
    deductions: 4000,
    netSalary: 54000,
    status: "Pending",
  },
  {
    id: "PAY-1003",
    employeeId: "EMP-1003",
    name: "Rohan Das",
    department: "Finance",
    basicSalary: 52000,
    deductions: 3500,
    netSalary: 48500,
    status: "Paid",
  },
  {
    id: "PAY-1004",
    employeeId: "EMP-1004",
    name: "Ananya Singh",
    department: "Marketing",
    basicSalary: 48000,
    deductions: 3000,
    netSalary: 45000,
    status: "Pending",
  },
  {
    id: "PAY-1005",
    employeeId: "EMP-1005",
    name: "Vikram Rao",
    department: "Engineering",
    basicSalary: 62000,
    deductions: 4500,
    netSalary: 57500,
    status: "Processing",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Payroll = () => {
  const [payroll, setPayroll] = useState(initialPayroll);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayroll = payroll.filter((item) => {
    const matchesSearch = `${item.name} ${item.employeeId} ${item.department}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "All" || item.status === statusFilter)
    );
  });

  const totalNetPayroll = payroll.reduce(
    (total, item) => total + item.netSalary,
    0
  );

  const paidPayroll = payroll
    .filter((item) => item.status === "Paid")
    .reduce((total, item) => total + item.netSalary, 0);

  const pendingCount = payroll.filter(
    (item) => item.status === "Pending"
  ).length;

  const markAsPaid = (id) => {
    setPayroll((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: "Paid" } : item
      )
    );
  };

  const summary = [
    {
      title: "Total Net Payroll",
      value: formatCurrency(totalNetPayroll),
      color: "text-blue-600",
    },
    {
      title: "Salary Paid",
      value: formatCurrency(paidPayroll),
      color: "text-emerald-600",
    },
    {
      title: "Pending Payments",
      value: pendingCount,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payroll Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review employee salaries, deductions, and payment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Payroll
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <h2 className="font-semibold text-slate-900">Employee Payroll</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search payroll records"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter payroll by status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Basic Salary</th>
                <th className="px-5 py-3 text-right">Deductions</th>
                <th className="px-5 py-3 text-right">Net Salary</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPayroll.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.employeeId}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {item.department}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-slate-600">
                    {formatCurrency(item.basicSalary)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-slate-600">
                    {formatCurrency(item.deductions)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(item.netSalary)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        item.status === "Paid"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : item.status === "Pending"
                            ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                            : "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
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

              {filteredPayroll.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No payroll records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredPayroll.length} of {payroll.length} sample records
        </div>
      </section>
    </div>
  );
};

export default Payroll;
