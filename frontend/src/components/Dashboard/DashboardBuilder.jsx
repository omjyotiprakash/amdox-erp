import MetricsCard from "./MetricsCard"

const DashboardBuilder = ({ widgets = [] }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {widgets.map((widget) => (
        <MetricsCard key={widget.title} {...widget} />
      ))}

      {widgets.length === 0 && (
        <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No dashboard widgets have been added yet.
        </p>
      )}
    </div>
  )
}

export default DashboardBuilder