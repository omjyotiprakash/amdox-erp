import MetricsCard from "./MetricsCard"

const executiveMetrics = [
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

const ExecutiveDashboard = () => {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Executive Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Monitor key business metrics from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {executiveMetrics.map((metric) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>
    </section>
  )
}

export default ExecutiveDashboard