
import { useState } from "react";

const initialProject = {
  id: "PRJ-1001",
  name: "ERP Platform Development",
  description:
    "Develop an integrated ERP platform to manage finance, human resources, inventory, procurement, and project operations from a single dashboard.",
  client: "Internal",
  manager: "Rahul Sharma",
  startDate: "2026-08-01",
  dueDate: "2026-12-15",
  budget: 850000,
  spent: 425000,
  progress: 55,
  status: "In Progress",
  priority: "High",
};

const initialMilestones = [
  {
    id: 1,
    title: "Requirements and Planning",
    dueDate: "2026-08-15",
    status: "Completed",
  },
  {
    id: 2,
    title: "UI/UX and Frontend Development",
    dueDate: "2026-10-15",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Backend and Database Integration",
    dueDate: "2026-11-15",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Testing and Deployment",
    dueDate: "2026-12-15",
    status: "Upcoming",
  },
];

const teamMembers = [
  { name: "Rahul Sharma", role: "Project Manager", initials: "RS" },
  { name: "Priya Das", role: "Frontend Developer", initials: "PD" },
  { name: "Amit Kumar", role: "Backend Developer", initials: "AK" },
  { name: "Sneha Patel", role: "UI/UX Designer", initials: "SP" },
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

const ProjectDetail = () => {
  const [project, setProject] = useState(initialProject);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialProject);
  const [newMilestone, setNewMilestone] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  const updateDraft = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const saveProject = (event) => {
    event.preventDefault();

    const budget = Number(draft.budget);
    const spent = Number(draft.spent);
    const progress = Number(draft.progress);

    if (
      !draft.name.trim() ||
      !Number.isFinite(budget) ||
      !Number.isFinite(spent) ||
      budget < 0 ||
      spent < 0 ||
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100 ||
      draft.startDate > draft.dueDate
    ) {
      window.alert(
        "Check the project name, budget, expenditure, progress, and dates."
      );
      return;
    }

    setProject({
      ...draft,
      name: draft.name.trim(),
      budget,
      spent,
      progress,
    });
    setEditing(false);
  };

  const updateMilestoneStatus = (id, status) => {
    setMilestones((previous) =>
      previous.map((milestone) =>
        milestone.id === id ? { ...milestone, status } : milestone
      )
    );
  };

  const addMilestone = (event) => {
    event.preventDefault();

    if (!newMilestone.trim() || !newMilestoneDate) {
      window.alert("Enter a milestone name and due date.");
      return;
    }

    setMilestones((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: newMilestone.trim(),
        dueDate: newMilestoneDate,
        status: "Upcoming",
      },
    ]);

    setNewMilestone("");
    setNewMilestoneDate("");
  };

  const completedMilestones = milestones.filter(
    (milestone) => milestone.status === "Completed"
  ).length;

  const budgetPercentage =
    project.budget > 0
      ? Math.round((project.spent / project.budget) * 100)
      : 0;

  const projectStatusStyles = {
    Planning: "bg-slate-100 text-slate-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Completed: "bg-emerald-50 text-emerald-700",
    "On Hold": "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  const milestoneStyles = {
    Completed: "bg-emerald-50 text-emerald-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Upcoming: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">{project.id}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Project overview, milestones, team, and budget.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Details
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft({ ...project });
              setEditing((previous) => !previous);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {editing ? "Cancel Editing" : "Edit Project"}
          </button>
        </div>
      </div>

      {editing && (
        <form
          onSubmit={saveProject}
          className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Edit Project Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-600">
              Project Name
              <input
                required
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Client
              <input
                value={draft.client}
                onChange={(event) => updateDraft("client", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Project Manager
              <input
                value={draft.manager}
                onChange={(event) => updateDraft("manager", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Priority
              <select
                value={draft.priority}
                onChange={(event) => updateDraft("priority", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>

            <label className="text-sm text-slate-600">
              Start Date
              <input
                type="date"
                required
                value={draft.startDate}
                onChange={(event) => updateDraft("startDate", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Due Date
              <input
                type="date"
                required
                value={draft.dueDate}
                onChange={(event) => updateDraft("dueDate", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Total Budget (₹)
              <input
                type="number"
                min="0"
                required
                value={draft.budget}
                onChange={(event) => updateDraft("budget", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Amount Spent (₹)
              <input
                type="number"
                min="0"
                required
                value={draft.spent}
                onChange={(event) => updateDraft("spent", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Progress ({draft.progress}%)
              <input
                type="range"
                min="0"
                max="100"
                value={draft.progress}
                onChange={(event) => updateDraft("progress", event.target.value)}
                className="mt-3 block w-full accent-blue-600"
              />
            </label>

            <label className="text-sm text-slate-600">
              Project Status
              <select
                value={draft.status}
                onChange={(event) => updateDraft("status", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
                <option>Cancelled</option>
              </select>
            </label>
          </div>

          <label className="block text-sm text-slate-600">
            Description
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) =>
                updateDraft("description", event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Project Overview
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {project.description}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              projectStatusStyles[project.status] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Project Manager</p>
            <p className="mt-1 font-semibold text-slate-900">
              {project.manager}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Client</p>
            <p className="mt-1 font-semibold text-slate-900">{project.client}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Start Date</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDate(project.startDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Due Date</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDate(project.dueDate)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Budget</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(project.budget)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Amount Spent</p>
          <p className="mt-2 text-xl font-bold text-blue-600">
            {formatCurrency(project.spent)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Remaining Budget</p>
          <p
            className={`mt-2 text-xl font-bold ${
              project.budget - project.spent < 0
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {formatCurrency(project.budget - project.spent)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Milestones Completed</p>
          <p className="mt-2 text-xl font-bold text-violet-600">
            {completedMilestones} / {milestones.length}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Overall Progress</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update progress using the Edit Project button.
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {project.progress}%
          </span>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Overall project progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>Started {formatDate(project.startDate)}</span>
          <span>Due {formatDate(project.dueDate)}</span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Budget Utilization
            </h3>
            <span
              className={`text-sm font-semibold ${
                budgetPercentage > 100 ? "text-red-600" : "text-slate-700"
              }`}
            >
              {budgetPercentage}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                budgetPercentage > 100 ? "bg-red-500" : "bg-violet-600"
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">Project Milestones</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track key deliverables and their target dates.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-slate-900">{milestone.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Due {formatDate(milestone.dueDate)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    milestoneStyles[milestone.status]
                  }`}
                >
                  {milestone.status}
                </span>

                <select
                  value={milestone.status}
                  onChange={(event) =>
                    updateMilestoneStatus(milestone.id, event.target.value)
                  }
                  aria-label={`Update ${milestone.title} status`}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                >
                  <option>Upcoming</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          ))}

          {milestones.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              No milestones added yet.
            </p>
          )}
        </div>

        <form
          onSubmit={addMilestone}
          className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            value={newMilestone}
            onChange={(event) => setNewMilestone(event.target.value)}
            placeholder="New milestone name"
            aria-label="New milestone name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <input
            type="date"
            value={newMilestoneDate}
            onChange={(event) => setNewMilestoneDate(event.target.value)}
            aria-label="New milestone due date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Add Milestone
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">Project Team</h2>
          <p className="mt-1 text-sm text-slate-500">
            Team members assigned to this sample project.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                {member.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {member.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;
