
import { useState } from "react";

const initialResources = [
  {
    id: "RES-1001",
    name: "Rahul Sharma",
    role: "Project Manager",
    department: "Management",
    project: "ERP Platform Development",
    allocation: 80,
    hours: 32,
    status: "Available",
  },
  {
    id: "RES-1002",
    name: "Priya Das",
    role: "Frontend Developer",
    department: "Engineering",
    project: "ERP Platform Development",
    allocation: 100,
    hours: 40,
    status: "Fully Allocated",
  },
  {
    id: "RES-1003",
    name: "Amit Kumar",
    role: "Backend Developer",
    department: "Engineering",
    project: "Inventory Automation",
    allocation: 75,
    hours: 30,
    status: "Available",
  },
  {
    id: "RES-1004",
    name: "Sneha Patel",
    role: "UI/UX Designer",
    department: "Design",
    project: "Employee Portal",
    allocation: 50,
    hours: 20,
    status: "Available",
  },
  {
    id: "RES-1005",
    name: "Arjun Singh",
    role: "QA Engineer",
    department: "Quality Assurance",
    project: "Supplier Integration",
    allocation: 100,
    hours: 40,
    status: "Fully Allocated",
  },
  {
    id: "RES-1006",
    name: "Neha Mishra",
    role: "Business Analyst",
    department: "Management",
    project: "Unassigned",
    allocation: 0,
    hours: 0,
    status: "Unassigned",
  },
];

const projects = [
  "ERP Platform Development",
  "Inventory Automation",
  "Employee Portal",
  "Supplier Integration",
  "Analytics Dashboard",
  "Unassigned",
];

const formatHours = (hours) => `${hours} hrs/week`;

const getStatus = (allocation) => {
  if (allocation === 0) return "Unassigned";
  if (allocation >= 100) return "Fully Allocated";
  return "Available";
};

const ResourcePlanning = () => {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingResource, setEditingResource] = useState(null);

  const allocatedCount = resources.filter(
    (resource) => resource.allocation > 0
  ).length;

  const availableCount = resources.filter(
    (resource) =>
      resource.allocation > 0 && resource.allocation < 100
  ).length;

  const unassignedCount = resources.filter(
    (resource) => resource.allocation === 0
  ).length;

  const totalWeeklyHours = resources.reduce(
    (sum, resource) => sum + resource.hours,
    0
  );

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = [
      resource.name,
      resource.role,
      resource.project,
      resource.id,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" ||
      resource.department === departmentFilter;

    const matchesStatus =
      statusFilter === "All" || getStatus(resource.allocation) === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const saveResource = (event) => {
    event.preventDefault();

    const allocation = Number(editingResource.allocation);

    if (
      !Number.isFinite(allocation) ||
      !Number.isInteger(allocation) ||
      allocation < 0 ||
      allocation > 100
    ) {
      window.alert("Allocation must be a whole number from 0 to 100.");
      return;
    }

    const selectedProject = editingResource.project;
    const hours = Math.round((allocation / 100) * 40);

    setResources((previous) =>
      previous.map((resource) =>
        resource.id === editingResource.id
          ? {
              ...resource,
              project: selectedProject,
              allocation,
              hours,
              status: getStatus(allocation),
            }
          : resource
      )
    );

    setEditingResource(null);
  };

  const summary = [
    {
      title: "Total Resources",
      value: resources.length,
      color: "text-blue-600",
    },
    {
      title: "Assigned Resources",
      value: allocatedCount,
      color: "text-violet-600",
    },
    {
      title: "Partially Available",
      value: availableCount,
      color: "text-emerald-600",
    },
    {
      title: "Unassigned Resources",
      value: unassignedCount,
      color: "text-amber-600",
    },
  ];

  const allocationStyle = (allocation) => {
    if (allocation >= 100) return "bg-violet-600";
    if (allocation >= 75) return "bg-blue-600";
    if (allocation > 0) return "bg-emerald-500";
    return "bg-slate-300";
  };

  const statusStyle = (allocation) => {
    if (allocation === 0) return "bg-amber-50 text-amber-700";
    if (allocation >= 100) return "bg-violet-50 text-violet-700";
    return "bg-emerald-50 text-emerald-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resource Planning
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Allocate employees across projects and monitor team capacity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Resource Plan
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Weekly Team Capacity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on a sample capacity of 40 hours per person per week.
            </p>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {totalWeeklyHours} / {resources.length * 40} hrs
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${
                resources.length > 0
                  ? (totalWeeklyHours / (resources.length * 40)) * 100
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-600" />
            Allocated: {totalWeeklyHours} hours
          </span>
          <span>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-300" />
            Remaining: {resources.length * 40 - totalWeeklyHours} hours
          </span>
        </div>
      </section>

      {editingResource && (
        <form
          onSubmit={saveResource}
          className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="font-semibold text-slate-900">
              Update Resource Allocation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingResource.name} · {editingResource.role}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-600">
              Project
              <select
                value={editingResource.project}
                onChange={(event) =>
                  setEditingResource((previous) => ({
                    ...previous,
                    project: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-600">
              Allocation: {editingResource.allocation}%
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={editingResource.allocation}
                onChange={(event) =>
                  setEditingResource((previous) => ({
                    ...previous,
                    allocation: Number(event.target.value),
                  }))
                }
                className="mt-3 block w-full accent-blue-600"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Estimated weekly hours:{" "}
                {Math.round((editingResource.allocation / 100) * 40)}
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Allocation
            </button>
            <button
              type="button"
              onClick={() => setEditingResource(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Resource Allocation Directory
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee, role, project..."
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
              <option value="Management">Management</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by availability"
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
                <th className="px-5 py-3">Assigned Project</th>
                <th className="px-5 py-3">Allocation</th>
                <th className="px-5 py-3">Weekly Hours</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {resource.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {resource.id} · {resource.role}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {resource.department}
                  </td>

                  <td className="min-w-48 px-5 py-4 text-slate-700">
                    {resource.project}
                  </td>

                  <td className="min-w-40 px-5 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">
                        {resource.allocation}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${allocationStyle(
                          resource.allocation
                        )}`}
                        style={{ width: `${resource.allocation}%` }}
                      />
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatHours(resource.hours)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(
                        resource.allocation
                      )}`}
                    >
                      {getStatus(resource.allocation)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setEditingResource({ ...resource })}
                      className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}

              {filteredResources.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No resources match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredResources.length} of {resources.length} sample resources
        </div>
      </section>
    </div>
  );
};

export default ResourcePlanning;
