import { useState } from "react";
import ErrorBanner from "../components/common/ErrorBanner";
import FormModal from "../components/common/FormModal";
import { useFetch } from "../hooks/useFetch";
import {
  cancelMyLeave,
  fetchMyAttendance,
  fetchMyLeave,
  fetchMyPayslips,
  fetchMyProfile,
  requestMyLeave,
} from "../services/selfService";
import { localMonth, localToday } from "../utils/dateUtils";
import { formatCurrency, formatDate } from "../utils/formatters";

const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Annual Leave", "Unpaid Leave"];

const badge = {
  Present: "bg-emerald-50 text-emerald-700",
  Late: "bg-amber-50 text-amber-700",
  Absent: "bg-red-50 text-red-700",
  "On Leave": "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Processing: "bg-blue-50 text-blue-700",
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const Pill = ({ value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[value] || "bg-slate-100 text-slate-600"}`}>
    {value}
  </span>
);

const Card = ({ title, subtitle, action, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const display = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const MyProfile = () => {
  const [month, setMonth] = useState(localMonth);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [actionError, setActionError] = useState("");

  const profile = useFetch(fetchMyProfile, []);
  const attendance = useFetch(() => fetchMyAttendance(month), [month]);
  const leave = useFetch(fetchMyLeave, []);
  const payslips = useFetch(fetchMyPayslips, []);

  const me = profile.data?.employee;
  const linked = profile.data?.linked;
  const email = profile.data?.email;

  const cancel = async (request) => {
    if (!window.confirm(`Cancel your ${request.type} request (${request.from} to ${request.to})?`)) return;
    setActionError("");
    try {
      await cancelMyLeave(request.id);
      leave.reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const days = attendance.data?.summary ?? { present: 0, late: 0, absent: 0, onLeave: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your own details, attendance, leave and payslips. Only you can see this page.
        </p>
      </div>

      <ErrorBanner message={profile.error} onRetry={profile.reload} />
      <ErrorBanner message={actionError} />

      {profile.data && !linked && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-semibold">No employee record is linked to your account yet.</p>
          <p className="mt-1">
            Ask HR to add you in the Employee Directory using your sign-in email,{" "}
            <span className="font-semibold">{email}</span>. Your attendance, leave and payslips will appear here
            once they do.
          </p>
        </div>
      )}

      {me && (
        <Card title={me.name} subtitle={`${me.jobTitle} · ${me.department}`} action={<Pill value={me.status} />}>
          <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Employee ID", me.code],
              ["Work email", me.email],
              ["Department", me.department],
              ["Date joined", formatDate(me.joinedOn)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="mt-1 break-words font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {linked && (
        <>
          <Card
            title="My Attendance"
            subtitle="Days recorded for you in the chosen month."
            action={
              <input
                type="month"
                value={month}
                onChange={(event) => event.target.value && setMonth(event.target.value)}
                aria-label="Attendance month"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            }
          >
            <ErrorBanner message={attendance.error} onRetry={attendance.reload} />
            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:grid-cols-4">
              {[
                ["Present", days.present, "text-emerald-600"],
                ["Late", days.late, "text-amber-600"],
                ["Absent", days.absent, "text-red-600"],
                ["On leave", days.onLeave, "text-blue-600"],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Check in</th>
                    <th className="px-5 py-3">Check out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(attendance.data?.items ?? []).map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-700">{formatDate(row.date)}</td>
                      <td className="px-5 py-3"><Pill value={row.status} /></td>
                      <td className="px-5 py-3 text-slate-600">{display(row.checkIn)}</td>
                      <td className="px-5 py-3 text-slate-600">{display(row.checkOut)}</td>
                    </tr>
                  ))}
                  {(attendance.data?.items ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                        {attendance.loading ? "Loading..." : "No attendance recorded for this month."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card
            title="My Leave"
            subtitle={
              leave.data
                ? `${leave.data.summary.approvedDays} approved days, ${leave.data.summary.pending} waiting for approval`
                : "Request time off and track its approval."
            }
            action={
              <button
                type="button"
                onClick={() => setShowLeaveForm(true)}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Request Leave
              </button>
            }
          >
            <ErrorBanner message={leave.error} onRetry={leave.reload} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Dates</th>
                    <th className="px-5 py-3">Days</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(leave.data?.items ?? []).map((request) => (
                    <tr key={request.id}>
                      <td className="px-5 py-3 text-slate-700">
                        {request.type}
                        {request.reason && <p className="mt-1 text-xs text-slate-400">{request.reason}</p>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {formatDate(request.from)} to {formatDate(request.to)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{request.days}</td>
                      <td className="px-5 py-3"><Pill value={request.status} /></td>
                      <td className="px-5 py-3">
                        {request.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() => cancel(request)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(leave.data?.items ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                        {leave.loading ? "Loading..." : "You have not requested any leave yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="My Payslips" subtitle="Your monthly pay, once HR has generated it.">
            <ErrorBanner message={payslips.error} onRetry={payslips.reload} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Month</th>
                    <th className="px-5 py-3 text-right">Basic</th>
                    <th className="px-5 py-3 text-right">Deductions</th>
                    <th className="px-5 py-3 text-right">Net pay</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(payslips.data?.items ?? []).map((slip) => (
                    <tr key={slip.id}>
                      <td className="px-5 py-3 font-medium text-slate-900">{slip.month}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-slate-600">{formatCurrency(slip.basicSalary)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-slate-600">{formatCurrency(slip.deductions)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-slate-900">{formatCurrency(slip.netSalary)}</td>
                      <td className="px-5 py-3"><Pill value={slip.status} /></td>
                    </tr>
                  ))}
                  {(payslips.data?.items ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                        {payslips.loading ? "Loading..." : "No payslips yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {showLeaveForm && (
        <FormModal
          title="Request Leave"
          submitLabel="Submit Request"
          fields={[
            { name: "type", label: "Leave type", type: "select", options: LEAVE_TYPES },
            { name: "from", label: "From", type: "date" },
            { name: "to", label: "To", type: "date" },
            { name: "reason", label: "Reason (optional)", optional: true, placeholder: "e.g. Family function" },
          ]}
          initialValues={{ from: localToday(), to: localToday() }}
          onSubmit={async (values) => {
            await requestMyLeave(values);
            leave.reload();
          }}
          onClose={() => setShowLeaveForm(false)}
        />
      )}
    </div>
  );
};

export default MyProfile;
