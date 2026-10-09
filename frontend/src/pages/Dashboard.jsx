import { useState } from "react";
import MetricsCard from "../components/Dashboard/MetricsCard";

const stats = [
  {
    title: "Total Revenue",
    value: "₹0",
    description: "Overall business revenue",
    icon: "₹",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Total Employees",
    value: "0",
    description: "Employees in your organization",
    icon: "♙",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Active Projects",
    value: "0",
    description: "Projects currently in progress",
    icon: "▤",
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Pending Tasks",
    value: "0",
    description: "Tasks awaiting completion",
    icon: "◷",
    color: "bg-amber-50 text-amber-600",
  },
]

const modules = [
  {
    name: "Finance",
    description: "Manage accounts, transactions, and budgets.",
    icon: "₹",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Human Resources",
    description: "Manage employees, attendance, and payroll.",
    icon: "♙",
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Supply Chain",
    description: "Track inventory and manage suppliers.",
    icon: "⇄",
    color: "bg-orange-50 text-orange-600",
  },
  {
    name: "Projects",
    description: "Organize projects, tasks, and deadlines.",
    icon: "▤",
    color: "bg-violet-50 text-violet-600",
  },
  {
    name: "Reports",
    description: "Review business performance and analytics.",
    icon: "▥",
    color: "bg-pink-50 text-pink-600",
  },
  {
    name: "Settings",
    description: "Configure your workspace preferences.",
    icon: "⚙",
    color: "bg-slate-100 text-slate-600",
  },
]

const Dashboard = () => {
  const [search, setSearch] = useState("");

  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
          Your workspace
        </p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
          Welcome to AMDox ERP
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Manage your business operations, employees, finances, and projects
          from one centralized workspace.
        </p>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Business Overview
          </h2>
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

      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Explore Modules
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Access your core business tools.
            </p>
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
          {filteredModules.map((module) => (
            <article
              key={module.name}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-semibold ${module.color}`}
                >
                  {module.icon}
                </span>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {module.name}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {module.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <span className="text-sm font-medium text-blue-600">
                  Module overview
                </span>
              </div>
            </article>
          ))}

          {filteredModules.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No modules match "{search}".
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Dashboard