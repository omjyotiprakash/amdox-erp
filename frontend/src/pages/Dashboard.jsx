import { useState } from "react";
import { Link } from "react-router-dom";
import MetricsCard from "../components/Dashboard/MetricsCard";
import ErrorBanner from "../components/common/ErrorBanner";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useFetch } from "../hooks/useFetch";
import { fetchDashboard } from "../services/dashboardService";
import { formatCurrency } from "../utils/formatters";

// "key" is the permission module a user needs to see the card.
const modules = [
  { key: "finance", name: "Finance", path: "/finance/ledger", description: "Manage accounts, transactions, and budgets.", icon: "₹", color: "bg-emerald-50 text-emerald-600" },
  { key: "hr", name: "Human Resources", path: "/hr/employees", description: "Manage employees, attendance, and payroll.", icon: "♙", color: "bg-blue-50 text-blue-600" },
  { key: "supplyChain", name: "Supply Chain", path: "/supply-chain/inventory", description: "Track inventory and manage suppliers.", icon: "⇄", color: "bg-orange-50 text-orange-600" },
  { key: "projects", name: "Projects", path: "/projects", description: "Organize projects, resources, and deadlines.", icon: "▤", color: "bg-violet-50 text-violet-600" },
  { key: "reports", name: "Reports", path: "/reports", description: "Review business performance and analytics.", icon: "▥", color: "bg-pink-50 text-pink-600" },
  { key: "settings", name: "Settings", path: "/settings/general", description: "Configure your workspace, users, and access.", icon: "⚙", color: "bg-slate-100 text-slate-600" },
];

const levelStyle = {
  danger: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { items: alerts } = useNotifications();
  const { data, loading, error, reload } = useFetch(fetchDashboard, []);

  const allowed = data?.modules ?? [];
  const pendingApprovals = (data?.hr?.pendingLeave ?? 0) + (data?.supplyChain?.pendingOrders ?? 0);
  const hasApprovals = Boolean(data?.hr || data?.supplyChain);

  const stats = [
    data?.finance && {
      title: "Total Revenue",
      value: formatCurrency(data.finance.income),
      description: `Net ${formatCurrency(data.finance.net)} after expenses`,
      icon: "₹",
      color: "bg-emerald-50 text-emerald-600",
    },
    data?.hr && {
      title: "Total Employees",
      value: data.hr.employees,
      description: `${data.hr.active} active, ${data.hr.onLeave} on leave`,
      icon: "♙",
      color: "bg-blue-50 text-blue-600",
    },
    data?.projects && {
      title: "Active Projects",
      value: data.projects.active,
      description: `${data.projects.total} projects in total`,
      icon: "▤",
      color: "bg-violet-50 text-violet-600",
    },
    hasApprovals && {
      title: "Pending Approvals",
      value: pendingApprovals,
      description: "Leave requests and purchase orders awaiting a decision",
      icon: "◷",
      color: "bg-amber-50 text-amber-600",
    },
  ].filter(Boolean);

  const visibleModules = modules
    .filter((module) => allowed.includes(module.key))
    .filter((module) => module.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-linear-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
          Your workspace
        </p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Manage your business operations, employees, finances, and projects
          from one centralized workspace.
        </p>
      </section>

      <ErrorBanner message={error} onRetry={reload} />

      {stats.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Business Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at your organization's key metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <MetricsCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Needs Attention</h2>
          <p className="mt-1 text-sm text-slate-500">
            Items across your modules that may need action.
          </p>
        </div>

        {alerts.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            {loading ? "Checking your workspace..." : "You're all caught up. Nothing needs your attention."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <Link
                  to={alert.link}
                  className="flex items-center gap-3 px-5 py-4 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${levelStyle[alert.level]}`} />
                  <span className="flex-1">{alert.title}</span>
                  <span className="text-xs font-medium text-blue-600">View</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {allowed.length > 0 && (
        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Explore Modules</h2>
              <p className="mt-1 text-sm text-slate-500">Access your core business tools.</p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search modules..."
              aria-label="Search modules"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleModules.map((module) => (
              <Link
                key={module.key}
                to={module.path}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-semibold ${module.color}`}
                  >
                    {module.icon}
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{module.name}</h3>
                    <p className="mt-2 text-sm leading-5 text-slate-500">{module.description}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <span className="text-sm font-medium text-blue-600 group-hover:underline">
                    Open module
                  </span>
                </div>
              </Link>
            ))}

            {visibleModules.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No modules match "{search}".
              </p>
            )}
          </div>
        </section>
      )}

      {!loading && !error && allowed.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Your role doesn't have access to any modules yet. Ask an administrator to update your permissions.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
