
import { useState } from "react";

const modules = [
  "Dashboard",
  "Finance",
  "Human Resources",
  "Inventory",
  "Purchase Orders",
  "Projects",
  "Reports",
  "Settings",
];

const initialRoles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full access to all ERP modules and settings.",
    users: 2,
    permissions: modules.reduce((result, module) => {
      result[module] = ["View", "Create", "Edit", "Delete"];
      return result;
    }, {}),
  },
  {
    id: 2,
    name: "Finance Manager",
    description: "Manages financial records, transactions, and reports.",
    users: 4,
    permissions: {
      Dashboard: ["View"],
      Finance: ["View", "Create", "Edit"],
      "Human Resources": [],
      Inventory: [],
      "Purchase Orders": ["View"],
      Projects: ["View"],
      Reports: ["View", "Create"],
      Settings: [],
    },
  },
  {
    id: 3,
    name: "HR Manager",
    description: "Manages employees, attendance, leave, and payroll.",
    users: 3,
    permissions: {
      Dashboard: ["View"],
      Finance: [],
      "Human Resources": ["View", "Create", "Edit"],
      Inventory: [],
      "Purchase Orders": [],
      Projects: ["View"],
      Reports: ["View"],
      Settings: [],
    },
  },
  {
    id: 4,
    name: "Inventory Manager",
    description: "Manages stock, suppliers, and purchase orders.",
    users: 5,
    permissions: {
      Dashboard: ["View"],
      Finance: [],
      "Human Resources": [],
      Inventory: ["View", "Create", "Edit"],
      "Purchase Orders": ["View", "Create", "Edit"],
      Projects: [],
      Reports: ["View"],
      Settings: [],
    },
  },
  {
    id: 5,
    name: "Employee",
    description: "Basic access to permitted employee and project information.",
    users: 18,
    permissions: {
      Dashboard: ["View"],
      Finance: [],
      "Human Resources": ["View"],
      Inventory: [],
      "Purchase Orders": [],
      Projects: ["View"],
      Reports: [],
      Settings: [],
    },
  },
];

const permissionTypes = ["View", "Create", "Edit", "Delete"];

const Roles = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [search, setSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [draftPermissions, setDraftPermissions] = useState(null);
  const [message, setMessage] = useState("");

  const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);

  const filteredRoles = roles.filter((role) =>
    `${role.name} ${role.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  const openPermissions = (role) => {
    setSelectedRoleId(role.id);
    setDraftPermissions(
      Object.fromEntries(
        modules.map((module) => [
          module,
          [...(role.permissions[module] || [])],
        ])
      )
    );
    setMessage("");
  };

  const togglePermission = (module, permission) => {
    setDraftPermissions((previous) => {
      const current = previous[module] || [];
      const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];

      return { ...previous, [module]: next };
    });
  };

  const toggleModule = (module, checked) => {
    setDraftPermissions((previous) => ({
      ...previous,
      [module]: checked ? [...permissionTypes] : [],
    }));
  };

  const savePermissions = () => {
    if (!selectedRole) return;

    setRoles((previous) =>
      previous.map((role) =>
        role.id === selectedRole.id
          ? { ...role, permissions: draftPermissions }
          : role
      )
    );

    setMessage(`Permissions updated for ${selectedRole.name}.`);
    setSelectedRoleId(null);
    setDraftPermissions(null);
  };

  const cancelEditing = () => {
    setSelectedRoleId(null);
    setDraftPermissions(null);
  };

  const permissionCount = (role) =>
    Object.values(role.permissions).reduce(
      (total, permissions) => total + permissions.length,
      0
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review roles and configure module-level access permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Roles
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Roles</p>
          <p className="mt-3 text-2xl font-bold text-blue-600">
            {roles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Users Assigned to Roles</p>
          <p className="mt-3 text-2xl font-bold text-violet-600">
            {totalUsers}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available Modules</p>
          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {modules.length}
          </p>
        </div>
      </div>

      {selectedRole && draftPermissions && (
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">
                Edit Permissions: {selectedRole.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose which actions this role can perform in each module.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelEditing}
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
                  {permissionTypes.map((permission) => (
                    <th
                      key={permission}
                      className="px-3 py-3 text-center"
                    >
                      {permission}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {modules.map((module) => {
                  const current = draftPermissions[module] || [];
                  const allSelected = permissionTypes.every((permission) =>
                    current.includes(permission)
                  );

                  return (
                    <tr key={module} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                        {module}
                      </td>

                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(event) =>
                            toggleModule(module, event.target.checked)
                          }
                          aria-label={`Toggle all permissions for ${module}`}
                          className="h-4 w-4 accent-blue-600"
                        />
                      </td>

                      {permissionTypes.map((permission) => (
                        <td
                          key={permission}
                          className="px-3 py-4 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={current.includes(permission)}
                            onChange={() =>
                              togglePermission(module, permission)
                            }
                            aria-label={`${permission} permission for ${module}`}
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
              onClick={cancelEditing}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Discard Changes
            </button>

            <button
              type="button"
              onClick={savePermissions}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Permissions
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
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-medium text-slate-900">{role.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      ROLE-{String(role.id).padStart(3, "0")}
                    </p>
                  </td>

                  <td className="min-w-64 px-5 py-4 text-slate-600">
                    {role.description}
                  </td>

                  <td className="px-5 py-4 text-slate-700">{role.users}</td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {permissionCount(role)} permissions
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openPermissions(role)}
                      className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800"
                    >
                      Manage Permissions
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No roles match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredRoles.length} of {roles.length} sample roles
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-400">
        Demo only: permission changes are stored in component state and reset
        on refresh. They do not enforce access restrictions or change actual
        user privileges until connected to backend authorization.
      </p>
    </div>
  );
};

export default Roles;
