import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { createRole, deleteRole, fetchRoles, saveRolePermissions } from "../../services/settingsService";

const MODULE_LABELS = {
  dashboard: "Dashboard",
  finance: "Finance",
  hr: "Human Resources",
  supplyChain: "Supply Chain",
  projects: "Projects",
  reports: "Reports",
  settings: "Settings",
};

const ACTION_LABELS = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };

const countPermissions = (role) =>
  Object.values(role.permissions).reduce(
    (total, actions) => total + Object.values(actions).filter(Boolean).length,
    0
  );

const Roles = () => {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchRoles({ search: debouncedSearch }),
    [debouncedSearch]
  );

  const roles = data?.items ?? [];
  const modules = data?.modules ?? [];
  const actions = data?.actions ?? [];
  const totals = data?.summary ?? { total: 0, assignedUsers: 0, modules: 0 };

  const openPermissions = (role) => {
    setSelectedRole(role);
    setDraft(JSON.parse(JSON.stringify(role.permissions)));
    setMessage("");
    setActionError("");
  };

  const closeEditor = () => {
    setSelectedRole(null);
    setDraft(null);
  };

  const toggle = (module, action) =>
    setDraft((previous) => ({
      ...previous,
      [module]: { ...previous[module], [action]: !previous[module][action] },
    }));

  const toggleModule = (module, checked) =>
    setDraft((previous) => ({
      ...previous,
      [module]: Object.fromEntries(actions.map((action) => [action, checked])),
    }));

  const savePermissions = async () => {
    setSaving(true);
    setActionError("");
    try {
      await saveRolePermissions(selectedRole.id, draft);
      setMessage(`Permissions updated for ${selectedRole.name}. They apply immediately.`);
      closeEditor();
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete the ${role.name} role?`)) return;
    setActionError("");
    setMessage("");
    try {
      await deleteRole(role.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const isAdminRole = selectedRole?.name === "Admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review roles and configure module-level access permissions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New Role
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Roles
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      {message && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Roles</p>
          <p className="mt-3 text-2xl font-bold text-blue-600">{totals.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Users Assigned to Roles</p>
          <p className="mt-3 text-2xl font-bold text-violet-600">{totals.assignedUsers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available Modules</p>
          <p className="mt-3 text-2xl font-bold text-emerald-600">{totals.modules}</p>
        </div>
      </div>

      {selectedRole && draft && (
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">Edit Permissions: {selectedRole.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isAdminRole
                  ? "The Admin role always has full access and cannot be changed."
                  : "Choose which actions this role can perform in each module."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-3 py-3 text-center">All</th>
                  {actions.map((action) => (
                    <th key={action} className="px-3 py-3 text-center">
                      {ACTION_LABELS[action]}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {modules.map((module) => {
                  const current = draft[module];
                  const allSelected = actions.every((action) => current[action]);

                  return (
                    <tr key={module} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                        {MODULE_LABELS[module]}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          disabled={isAdminRole}
                          onChange={(event) => toggleModule(module, event.target.checked)}
                          aria-label={`Toggle all permissions for ${MODULE_LABELS[module]}`}
                          className="h-4 w-4 accent-blue-600"
                        />
                      </td>
                      {actions.map((action) => (
                        <td key={action} className="px-3 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(current[action])}
                            disabled={isAdminRole}
                            onChange={() => toggle(module, action)}
                            aria-label={`${ACTION_LABELS[action]} permission for ${MODULE_LABELS[module]}`}
                            className="h-4 w-4 accent-blue-600"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-5">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={savePermissions}
              disabled={saving || isAdminRole}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Role Directory</h2>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search roles..."
            aria-label="Search roles"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 sm:max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Assigned Users</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-medium text-slate-900">{role.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{role.isSystem ? "Built-in role" : "Custom role"}</p>
                  </td>
                  <td className="min-w-64 px-5 py-4 text-slate-600">{role.description || "—"}</td>
                  <td className="px-5 py-4 text-slate-700">{role.users}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {countPermissions(role)} permissions
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openPermissions(role)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Manage Permissions
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDelete(role)}
                        className="ml-4 font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    {loading ? "Loading roles..." : "No roles match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {roles.length} of {data?.total ?? 0} roles
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-400">
        Permission changes are enforced by the server and apply to a user's next action. A user may
        need to reload the page to see menu items appear or disappear.
      </p>

      {showForm && (
        <FormModal
          title="New Role"
          submitLabel="Create Role"
          fields={[
            { name: "name", label: "Role name", placeholder: "e.g. Finance Clerk" },
            { name: "description", label: "Description", optional: true, placeholder: "What is this role for?" },
          ]}
          onSubmit={async (values) => {
            await createRole(values);
            setMessage(`Role created. Use Manage Permissions to choose what it can do. Nothing is granted by default.`);
            reload();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Roles;
