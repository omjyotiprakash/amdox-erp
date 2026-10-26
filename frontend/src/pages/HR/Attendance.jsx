import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useFetch } from "../../hooks/useFetch";
import { fetchAttendance, markAttendance } from "../../services/hrService";
import { localToday } from "../../utils/dateUtils";

// Current local time as "HH:MM" (what the server stores).
const nowTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

// "09:02" -> "09:02 AM"
const display = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const statusClass = {
  Present: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
  Late: "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
  Absent: "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700",
  "On Leave": "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700",
  "Not marked": "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600",
};

const Attendance = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [attendanceDate, setAttendanceDate] = useState(localToday);
  const [actionError, setActionError] = useState("");

  const { data, loading, error, reload } = useFetch(
    () => fetchAttendance(attendanceDate),
    [attendanceDate]
  );

  const records = data?.items ?? [];
  const totals = data?.summary ?? { present: 0, late: 0, absent: 0, total: 0, notMarked: 0 };

  const term = search.toLowerCase();
  const filteredRecords = records.filter(
    (record) =>
      `${record.name} ${record.code} ${record.department}`.toLowerCase().includes(term) &&
      (statusFilter === "All" || record.status === statusFilter)
  );

  const mark = async (record, status, extra = {}) => {
    setActionError("");
    try {
      await markAttendance({
        employeeId: record.employeeId,
        date: attendanceDate,
        status,
        ...extra,
      });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const markWorking = (record, status) =>
    mark(record, status, { checkIn: record.checkIn || nowTime() });

  const summary = [
    { title: "Present", value: totals.present, color: "text-emerald-600" },
    { title: "Late Arrivals", value: totals.late, color: "text-amber-600" },
    { title: "Absent", value: totals.absent, color: "text-red-600" },
    { title: "Total Employees", value: totals.total, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review daily attendance, check-in records, and employee status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Attendance
        </button>
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Daily Attendance</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="date"
              value={attendanceDate}
              onChange={(event) => event.target.value && setAttendanceDate(event.target.value)}
              aria-label="Attendance date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search attendance"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter attendance status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
              <option value="Not marked">Not marked</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.employeeId} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{record.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{record.code}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{record.department}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {display(record.checkIn)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {display(record.checkOut)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusClass[record.status]}>{record.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {record.status !== "Present" && (
                      <button
                        type="button"
                        onClick={() => markWorking(record, "Present")}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark present
                      </button>
                    )}
                    {record.status !== "Late" && record.status !== "Present" && (
                      <button
                        type="button"
                        onClick={() => markWorking(record, "Late")}
                        className="ml-3 font-medium text-amber-600 hover:text-amber-800"
                      >
                        Late
                      </button>
                    )}
                    {record.status !== "Absent" && record.status !== "On Leave" && (
                      <button
                        type="button"
                        onClick={() => mark(record, "Absent")}
                        className="ml-3 font-medium text-red-600 hover:text-red-800"
                      >
                        Absent
                      </button>
                    )}
                    {record.checkIn && !record.checkOut && (
                      <button
                        type="button"
                        onClick={() => mark(record, record.status, { checkOut: nowTime() })}
                        className="ml-3 font-medium text-slate-600 hover:text-slate-900"
                      >
                        Check out
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading attendance..."
                      : records.length
                        ? "No employees match your search."
                        : "No active employees yet. Add employees on the Employee Directory page."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredRecords.length} of {records.length} employees
          {totals.notMarked > 0 && ` · ${totals.notMarked} not marked yet`}
        </div>
      </section>
    </div>
  );
};

export default Attendance;
