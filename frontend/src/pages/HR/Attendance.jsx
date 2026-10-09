
import { useState } from "react";

const initialAttendance = [
  { id: "EMP-1001", name: "Aarav Sharma", department: "Engineering", checkIn: "09:02 AM", checkOut: "06:05 PM", status: "Present" },
  { id: "EMP-1002", name: "Priya Patel", department: "Human Resources", checkIn: "08:55 AM", checkOut: "06:10 PM", status: "Present" },
  { id: "EMP-1003", name: "Rohan Das", department: "Finance", checkIn: "—", checkOut: "—", status: "On Leave" },
  { id: "EMP-1004", name: "Ananya Singh", department: "Marketing", checkIn: "09:35 AM", checkOut: "—", status: "Late" },
  { id: "EMP-1005", name: "Vikram Rao", department: "Engineering", checkIn: "—", checkOut: "—", status: "Absent" },
];

const Attendance = () => {
  const [records, setRecords] = useState(initialAttendance);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [attendanceDate, setAttendanceDate] = useState("2026-10-09");

  const filteredRecords = records.filter((record) => {
    const matchesSearch = `${record.name} ${record.id} ${record.department}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === "All" || record.status === statusFilter)
    );
  });

  const presentCount = records.filter(
    (record) => record.status === "Present"
  ).length;

  const lateCount = records.filter(
    (record) => record.status === "Late"
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "Absent"
  ).length;

  const markPresent = (id) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id
          ? { ...record, status: "Present", checkIn: record.checkIn === "—" ? "Not recorded" : record.checkIn }
          : record
      )
    );
  };

  const summary = [
    { title: "Present", value: presentCount, color: "text-emerald-600" },
    { title: "Late Arrivals", value: lateCount, color: "text-amber-600" },
    { title: "Absent", value: absentCount, color: "text-red-600" },
    { title: "Total Employees", value: records.length, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance Management
          </h1>
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Daily Attendance</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="date"
              value={attendanceDate}
              onChange={(event) => setAttendanceDate(event.target.value)}
              aria-label="Attendance date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search employees"
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
            </select>
          </div>

          <p className="text-xs text-slate-500">
            Selected date: {attendanceDate}
          </p>
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
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{record.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{record.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{record.department}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{record.checkIn}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{record.checkOut}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        record.status === "Present"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : record.status === "Late"
                            ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                            : record.status === "Absent"
                              ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {record.status !== "Present" && record.status !== "On Leave" ? (
                      <button
                        type="button"
                        onClick={() => markPresent(record.id)}
                        className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark present
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No attendance records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredRecords.length} of {records.length} sample records
        </div>
      </section>
    </div>
  );
};

export default Attendance;
