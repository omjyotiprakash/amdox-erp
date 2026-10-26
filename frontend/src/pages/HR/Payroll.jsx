import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { fetchPayroll, generatePayroll, setPayrollStatus } from "../../services/hrService";
import { localMonth } from "../../utils/dateUtils";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

const statusClass = {
  Paid: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
  Pending: "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
  Processing: "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700",
};

const Payroll = () => {
  const [month, setMonth] = useState(localMonth);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [generating, setGenerating] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchPayroll({ month, search: debouncedSearch, status: statusFilter }),
    [month, debouncedSearch, statusFilter]
  );

  const payroll = data?.items ?? [];
  const totals = data?.summary ?? { totalNet: 0, paid: 0, pendingCount: 0 };

  const handleGenerate = async () => {
    setActionError("");
    setNotice("");
    setGenerating(true);
    try {
      const { created, alreadyExisted } = await generatePayroll(month);
      setNotice(
        created
          ? `Created ${created} payroll ${created === 1 ? "entry" : "entries"} for ${month}.`
          : alreadyExisted
            ? `Payroll for ${month} has already been generated.`
            : "No employees with a salary to generate payroll for. Set salaries on the Employee Directory page."
      );
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const changeStatus = async (item, status) => {
    setActionError("");
    setNotice("");
    try {
      await setPayrollStatus(item.id, status);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const summary = [
    { title: "Total Net Payroll", value: formatCurrency(totals.totalNet), color: "text-blue-600" },
    { title: "Salary Paid", value: formatCurrency(totals.paid), color: "text-emerald-600" },
    { title: "Pending Payments", value: totals.pendingCount, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review monthly salaries, deductions, and payment status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? "Generating..." : "Generate Payroll"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Payroll
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />
      {notice && (
        <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {notice}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Employee Payroll</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="month"
              value={month}
              onChange={(event) => event.target.value && setMonth(event.target.value)}
              aria-label="Payroll month"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search payroll"
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
              {payroll.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.employee?.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.employee?.code} · {item.code}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.employee?.department}</td>
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
                    <span className={statusClass[item.status]}>{item.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {item.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(item, "Processing")}
                        className="mr-3 font-medium text-slate-600 hover:text-slate-900"
                      >
                        Start processing
                      </button>
                    )}
                    {item.status !== "Paid" ? (
                      <button
                        type="button"
                        onClick={() => changeStatus(item, "Paid")}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark as paid
                      </button>
                    ) : (
                      <span className="text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {payroll.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading payroll..."
                      : data?.total
                        ? "No payroll entries match your search."
                        : `No payroll for ${month} yet. Click Generate Payroll to create it from employee salaries.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {payroll.length} of {data?.total ?? 0} entries for {month}
        </div>
      </section>
    </div>
  );
};

export default Payroll;
