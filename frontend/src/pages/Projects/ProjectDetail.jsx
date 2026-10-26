import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useFetch } from "../../hooks/useFetch";
import {
  addMilestone,
  deleteMilestone,
  fetchProject,
  fetchProjects,
  setMilestoneStatus,
  updateProject,
} from "../../services/projectService";
import { formatCurrency, formatDate } from "../../utils/formatters";

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

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [actionError, setActionError] = useState("");

  const { data: list, loading: listLoading, error: listError } = useFetch(() => fetchProjects({}), []);
  const { data, loading, error, reload } = useFetch(
    () => (id ? fetchProject(id) : Promise.resolve(null)),
    [id]
  );

  // /projects/details with no id opens the first project.
  useEffect(() => {
    if (!id && list?.items?.length) navigate(`/projects/details/${list.items[0].id}`, { replace: true });
  }, [id, list, navigate]);

  const project = data?.project;
  const team = data?.team ?? [];
  const milestones = project?.milestones ?? [];

  const updateDraft = (field, value) => setDraft((previous) => ({ ...previous, [field]: value }));

  const startEditing = () => {
    setDraft({ ...project });
    setActionError("");
    setEditing((previous) => !previous);
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    try {
      const { name, client, manager, priority, startDate, dueDate, budget, spent, progress, status, description } = draft;
      await updateProject(id, { name, client, manager, priority, startDate, dueDate, budget, spent, progress, status, description });
      setEditing(false);
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action) => {
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleAddMilestone = async (event) => {
    event.preventDefault();
    await runAction(async () => {
      await addMilestone(id, { title: newMilestone, dueDate: newMilestoneDate });
      setNewMilestone("");
      setNewMilestoneDate("");
    });
  };

  if (!id) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        {listError ? (
          <ErrorBanner message={listError} />
        ) : listLoading ? (
          "Loading projects..."
        ) : (
          <>
            No projects yet.{" "}
            <Link to="/projects" className="font-medium text-blue-600 hover:underline">
              Create one on the Projects page.
            </Link>
          </>
        )}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error} onRetry={reload} />
        {loading && <p className="text-center text-slate-500">Loading project...</p>}
        {error && (
          <Link to="/projects" className="text-sm font-medium text-blue-600 hover:underline">
            Back to Projects
          </Link>
        )}
      </div>
    );
  }

  const completedMilestones = milestones.filter((milestone) => milestone.status === "Completed").length;
  const budgetPercentage = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">{project.code}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Project overview, milestones, team, and budget.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={id}
            onChange={(event) => navigate(`/projects/details/${event.target.value}`)}
            aria-label="Switch project"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {(list?.items ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Details
          </button>
          <button
            type="button"
            onClick={startEditing}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {editing ? "Cancel Editing" : "Edit Project"}
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      {editing && draft && (
        <form
          onSubmit={saveProject}
          className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Edit Project Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-600">
              Project Name
              <input required value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Client
              <input value={draft.client} onChange={(e) => updateDraft("client", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Project Manager
              <input value={draft.manager} onChange={(e) => updateDraft("manager", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Priority
              <select value={draft.priority} onChange={(e) => updateDraft("priority", e.target.value)} className={inputClass}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Start Date
              <input type="date" required value={draft.startDate} onChange={(e) => updateDraft("startDate", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Due Date
              <input type="date" required value={draft.dueDate} onChange={(e) => updateDraft("dueDate", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Total Budget (₹)
              <input type="number" min="0" required value={draft.budget} onChange={(e) => updateDraft("budget", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Amount Spent (₹)
              <input type="number" min="0" required value={draft.spent} onChange={(e) => updateDraft("spent", e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-600">
              Progress ({draft.progress}%)
              <input
                type="range"
                min="0"
                max="100"
                value={draft.progress}
                onChange={(e) => updateDraft("progress", e.target.value)}
                className="mt-3 block w-full accent-blue-600"
              />
            </label>
            <label className="text-sm text-slate-600">
              Project Status
              <select value={draft.status} onChange={(e) => updateDraft("status", e.target.value)} className={inputClass}>
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
            <textarea rows={3} value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} className={inputClass} />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Project Overview</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {project.description || "No description added yet."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {project.priority} priority
            </span>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                projectStatusStyles[project.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Project Manager</p>
            <p className="mt-1 font-semibold text-slate-900">{project.manager || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Client</p>
            <p className="mt-1 font-semibold text-slate-900">{project.client || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Start Date</p>
            <p className="mt-1 font-semibold text-slate-900">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Due Date</p>
            <p className="mt-1 font-semibold text-slate-900">{formatDate(project.dueDate)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Budget</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(project.budget)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Amount Spent</p>
          <p className="mt-2 text-xl font-bold text-blue-600">{formatCurrency(project.spent)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Remaining Budget</p>
          <p
            className={`mt-2 text-xl font-bold ${
              project.budget - project.spent < 0 ? "text-red-600" : "text-emerald-600"
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
            <p className="mt-1 text-sm text-slate-500">Update progress using the Edit Project button.</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Overall project progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
        >
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${project.progress}%` }} />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>Started {formatDate(project.startDate)}</span>
          <span>Due {formatDate(project.dueDate)}</span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Budget Utilization</h3>
            <span className={`text-sm font-semibold ${budgetPercentage > 100 ? "text-red-600" : "text-slate-700"}`}>
              {budgetPercentage}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${budgetPercentage > 100 ? "bg-red-500" : "bg-violet-600"}`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">Project Milestones</h2>
          <p className="mt-1 text-sm text-slate-500">Track key deliverables and their target dates.</p>
        </div>

        <div className="mt-5 space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-slate-900">{milestone.title}</p>
                <p className="mt-1 text-xs text-slate-500">Due {formatDate(milestone.dueDate)}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${milestoneStyles[milestone.status]}`}>
                  {milestone.status}
                </span>
                <select
                  value={milestone.status}
                  onChange={(event) => runAction(() => setMilestoneStatus(id, milestone.id, event.target.value))}
                  aria-label={`Update ${milestone.title} status`}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                >
                  <option>Upcoming</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <button
                  type="button"
                  onClick={() => runAction(() => deleteMilestone(id, milestone.id))}
                  aria-label={`Delete ${milestone.title}`}
                  className="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {milestones.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No milestones added yet.</p>
          )}
        </div>

        <form
          onSubmit={handleAddMilestone}
          className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            value={newMilestone}
            onChange={(event) => setNewMilestone(event.target.value)}
            placeholder="New milestone name"
            aria-label="New milestone name"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={newMilestoneDate}
            onChange={(event) => setNewMilestoneDate(event.target.value)}
            aria-label="New milestone due date"
            required
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Project Team</h2>
            <p className="mt-1 text-sm text-slate-500">Employees assigned to this project.</p>
          </div>
          <Link to="/projects/resources" className="text-sm font-medium text-blue-600 hover:underline">
            Manage on Resource Planning
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                {initials(member.employee?.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{member.employee?.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {member.employee?.jobTitle} · {member.allocation}%
                </p>
              </div>
            </div>
          ))}

          {team.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-slate-500">
              No one is assigned to this project yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;
