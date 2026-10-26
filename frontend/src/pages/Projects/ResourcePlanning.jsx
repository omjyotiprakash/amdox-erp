import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { assignResource, fetchResources, unassignResource } from "../../services/projectService";
import { useConfirm } from "../../context/ConfirmContext";

const statusStyle = (allocation) => {
  if (allocation === 0) return "bg-amber-50 text-amber-700";
  if (allocation >= 100) return "bg-violet-50 text-violet-700";
  return "bg-emerald-50 text-emerald-700";
};

const allocationStyle = (allocation) => {
  if (allocation >= 100) return "bg-violet-600";
  if (allocation >= 75) return "bg-blue-600";
  if (allocation > 0) return "bg-emerald-500";
  return "bg-slate-300";
};

const ResourcePlanning = () => {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigning, setAssigning] = useState(null); // the resource row being assigned
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchResources({ search: debouncedSearch, department: departmentFilter, status: statusFilter }),
    [debouncedSearch, departmentFilter, statusFilter]
  );

  const resources = data?.items ?? [];
  const totals = data?.summary ?? { total: 0, assigned: 0, partiallyAvailable: 0, unassigned: 0 };
  const departments = data?.departments ?? [];
  const projectOptions = (data?.projects ?? []).map((project) => ({
    value: project.id,
    label: `${project.code} · ${project.name}`,
  }));

  const handleUnassign = async (resource, assignment) => {
    if (!(await confirm({ title: "Remove from project?", message: `Remove ${resource.name} from ${assignment.project.name}?`, confirmLabel: "Remove", danger: true }))) return;
    setActionError("");
    try {
      await unassignResource(assignment.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const summary = [
    { title: "Total Resources", value: totals.total, color: "text-blue-600" },
    { title: "Assigned Resources", value: totals.assigned, color: "text-violet-600" },
    { title: "Partially Available", value: totals.partiallyAvailable, color: "text-emerald-600" },
    { title: "Unassigned Resources", value: totals.unassigned, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Planning</h1>
          <p className="mt-1 text-sm text-slate-500">
            Allocate employees across projects and monitor team capacity. Based on a 40-hour week.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Resources
        </button>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Resource Allocation Directory</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search resources"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Filter by department"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by allocation status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All allocation statuses</option>
              <option value="Available">Partially Available</option>
              <option value="Fully Allocated">Fully Allocated</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Assigned Projects</th>
                <th className="px-5 py-3">Allocation</th>
                <th className="px-5 py-3">Weekly Hours</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {resources.map((resource) => (
                <tr key={resource.employeeId} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{resource.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {resource.code} · {resource.jobTitle}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{resource.department}</td>
                  <td className="min-w-48 px-5 py-4 text-slate-700">
                    {resource.assignments.length === 0 ? (
                      <span className="text-slate-400">Unassigned</span>
                    ) : (
                      <ul className="space-y-1">
                        {resource.assignments.map((assignment) => (
                          <li key={assignment.id} className="flex items-center gap-2">
                            <span>
                              {assignment.project.name}{" "}
                              <span className="text-xs text-slate-500">({assignment.allocation}%)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUnassign(resource, assignment)}
                              aria-label={`Remove ${resource.name} from ${assignment.project.name}`}
                              className="text-xs font-medium text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="min-w-40 px-5 py-4">
                    <span className="font-medium text-slate-900">{resource.allocation}%</span>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${allocationStyle(resource.allocation)}`}
                        style={{ width: `${Math.min(resource.allocation, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{resource.hours} hrs/week</td>
                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(resource.allocation)}`}
                    >
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setAssigning(resource)}
                      disabled={resource.allocation >= 100 || projectOptions.length === 0}
                      title={
                        projectOptions.length === 0
                          ? "Create an active project first"
                          : resource.allocation >= 100
                            ? "Fully allocated"
                            : undefined
                      }
                      className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}

              {resources.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading resources..."
                      : data?.total
                        ? "No resources match your search or filters."
                        : "No active employees yet. Add employees on the Employee Directory page."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {resources.length} of {data?.total ?? 0} resources
        </div>
      </section>

      {assigning && (
        <FormModal
          title={`Assign ${assigning.name} (${100 - assigning.allocation}% free)`}
          submitLabel="Save Assignment"
          fields={[
            { name: "projectId", label: "Project", type: "select", options: projectOptions },
            { name: "allocation", label: "Allocation (%)", type: "number", step: "1", min: "1" },
          ]}
          initialValues={{ allocation: String(100 - assigning.allocation) }}
          onSubmit={async ({ projectId, allocation }) => {
            await assignResource({ employeeId: assigning.employeeId, projectId, allocation });
            reload();
          }}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  );
};

export default ResourcePlanning;
