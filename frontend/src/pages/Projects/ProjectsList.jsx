
import { useState } from "react";

const initialProjects = [
  {
    id: "PRJ-1001",
    name: "ERP Platform Development",
    client: "Internal",
    manager: "Rahul Sharma",
    startDate: "2026-08-01",
    dueDate: "2026-12-15",
    budget: 850000,
    spent: 425000,
    progress: 55,
    status: "In Progress",
  },
  {
    id: "PRJ-1002",
    name: "Inventory Automation",
    client: "TechSource India",
    manager: "Priya Das",
    startDate: "2026-07-15",
    dueDate: "2026-11-30",
    budget: 320000,
    spent: 185000,
    progress: 65,
    status: "In Progress",
  },
  {
    id: "PRJ-1003",
    name: "Employee Portal",
    client: "Internal",
    manager: "Amit Kumar",
    startDate: "2026-06-01",
    dueDate: "2026-09-30",
    budget: 250000,
    spent: 250000,
    progress: 100,
    status: "Completed",
  },
  {
    id: "PRJ-1004",
    name: "Supplier Integration",
    client: "Office Essentials",
    manager: "Sneha Patel",
    startDate: "2026-10-01",
    dueDate: "2027-01-15",
    budget: 400000,
    spent: 60000,
    progress: 20,
    status: "In Progress",
  },
  {
    id: "PRJ-1005",
    name: "Analytics Dashboard",
    client: "Internal",
    manager: "Arjun Singh",
    startDate: "2026-10-15",
    dueDate: "2027-02-28",
    budget: 500000,
    spent: 0,
    progress: 0,
    status: "Planning",
  },
  {
    id: "PRJ-1006",
    name: "Legacy System Migration",
    client: "Global Packaging",
    manager: "Rahul Sharma",
    startDate: "2026-05-01",
    dueDate: "2026-08-31",
    budget: 275000,
    spent: 90000,
    progress: 30,
    status: "On Hold",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const statusStyles = {
  Planning: "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

const ProjectsList = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const totalBudget = projects.reduce(
    (sum, project) => sum + project.budget,
    0
  );

  const totalSpent = projects.reduce(
    (sum, project) => sum + project.spent,
    0
  );

  const activeCount = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = [
      project.id,
      project.name,
      project.client,
      project.manager,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id, status) => {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === id ? { ...project, status } : project
      )
    );
  };

  const summary = [
    {
      title: "Total Projects",
      value: projects.length,
      color: "text-blue-600",
    },
    {
      title: "In Progress",
      value: activeCount,
      color: "text-violet-600",
    },
    {
      title: "Completed",
      value: completedCount,
      color: "text-emerald-600",
    },
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget),
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Projects Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan projects, track progress, and monitor budgets and deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Projects
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Budget Utilization</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalBudget > 0
              ? Math.round((totalSpent / totalBudget) * 100)
              : 0}
            %
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${
                  totalBudget > 0
                    ? Math.min((totalSpent / totalBudget) * 100, 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Remaining Budget</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalBudget - totalSpent)}
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
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
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
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.id} · {project.client}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {project.manager}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDate(project.dueDate)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {formatCurrency(project.budget)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Spent: {formatCurrency(project.spent)}
                    </p>
                  </td>

                  <td className="min-w-36 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-700">
                        {project.progress}%
                      </span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={project.progress}
                    >
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[project.status]
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={project.status}
                      onChange={(event) =>
                        updateStatus(project.id, event.target.value)
                      }
                      aria-label={`Update status for ${project.name}`}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No projects match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredProjects.length} of {projects.length} sample projects
        </div>
      </section>
    </div>
  );
};

export default ProjectsList;
