import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { createProject, deleteProject, fetchProjects, updateProject } from "../../services/projectService";
import { localToday } from "../../utils/dateUtils";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useConfirm } from "../../context/ConfirmContext";

const STATUSES = ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"];

const statusStyles = {
  Planning: "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

const projectFields = [
  { name: "name", label: "Project name", placeholder: "e.g. ERP Platform Development" },
  { name: "client", label: "Client", placeholder: "e.g. Internal" },
  { name: "manager", label: "Project manager", placeholder: "e.g. Rahul Sharma", optional: true },
  { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "dueDate", label: "Due date", type: "date" },
  { name: "budget", label: "Budget (INR)", type: "number", min: "0" },
  { name: "status", label: "Status", type: "select", options: STATUSES },
];

const ProjectsList = () => {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, statusFilter]);
  const { data, loading, error, reload } = useFetch(
    () => fetchProjects({ search: debouncedSearch, status: statusFilter, page }),
    [debouncedSearch, statusFilter, page]
  );

  const projects = data?.items ?? [];
  const totals = data?.summary ?? { total: 0, inProgress: 0, completed: 0, totalBudget: 0, totalSpent: 0 };
  const budgetUsed = totals.totalBudget > 0 ? Math.round((totals.totalSpent / totals.totalBudget) * 100) : 0;

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (project) => {
    if (!(await confirm({ title: "Delete project?", message: `Delete ${project.name} (${project.code})? Its milestones and team assignments will be removed.`, confirmLabel: "Delete", danger: true }))) return;
    runAction(() => deleteProject(project.id));
  };

  const summary = [
    { title: "Total Projects", value: totals.total, color: "text-blue-600" },
    { title: "In Progress", value: totals.inProgress, color: "text-violet-600" },
    { title: "Completed", value: totals.completed, color: "text-emerald-600" },
    { title: "Total Budget", value: formatCurrency(totals.totalBudget), color: "text-slate-900" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track project status, deadlines, budgets, and progress.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New Project
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Projects
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Budget Utilization</p>
            <span className={`text-sm font-semibold ${budgetUsed > 100 ? "text-red-600" : "text-slate-700"}`}>
              {budgetUsed}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${budgetUsed > 100 ? "bg-red-500" : "bg-violet-600"}`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formatCurrency(totals.totalSpent)} spent of {formatCurrency(totals.totalBudget)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Remaining Budget</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              totals.totalBudget - totals.totalSpent < 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(totals.totalBudget - totals.totalSpent)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Total allocated budget minus recorded expenditure.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Project Directory</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search project, client, manager..."
              aria-label="Search projects"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter projects by status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Manager</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Update Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link
                      to={`/projects/details/${project.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {project.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.code} · {project.client}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{project.manager || "—"}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(project.dueDate)}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-medium text-slate-900">{formatCurrency(project.budget)}</p>
                    <p className="mt-1 text-xs text-slate-500">Spent: {formatCurrency(project.spent)}</p>
                  </td>
                  <td className="min-w-36 px-5 py-4">
                    <span className="text-xs font-medium text-slate-700">{project.progress}%</span>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={project.progress}
                    >
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${project.progress}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <select
                      value={project.status}
                      onChange={(event) => runAction(() => updateProject(project.id, { status: event.target.value }))}
                      aria-label={`Update ${project.name} status`}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      className="ml-3 font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading projects..."
                      : data?.total
                        ? "No projects match your search or filters."
                        : "No projects yet. Click New Project to create the first one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {projects.length} of {data?.total ?? 0} projects
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>

      {showForm && (
        <FormModal
          title="New Project"
          submitLabel="Create Project"
          fields={projectFields}
          initialValues={{
            client: "Internal",
            priority: "Medium",
            startDate: localToday(),
            dueDate: localToday(),
            budget: "0",
            status: "Planning",
          }}
          onSubmit={async (values) => {
            await createProject(values);
            reload();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ProjectsList;
