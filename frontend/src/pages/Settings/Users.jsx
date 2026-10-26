import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { createUser, fetchUsers, updateUser } from "../../services/settingsService";
import { useConfirm } from "../../context/ConfirmContext";

const statusStyle = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
};

const formatLastLogin = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

const Users = () => {
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(null); // null | { user? } | { resetFor }
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchUsers({ search: debouncedSearch, roleId: roleFilter, status: statusFilter }),
    [debouncedSearch, roleFilter, statusFilter]
  );

  const users = data?.items ?? [];
  const roles = data?.roles ?? [];
  const totals = data?.summary ?? { total: 0, active: 0, inactive: 0, admins: 0 };
  const roleOptions = roles.map((role) => ({ value: role.id, label: role.name }));

  const runAction = async (action, success) => {
    setActionError("");
    setMessage("");
    try {
      await action();
      if (success) setMessage(success);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const toggleStatus = async (user) => {
    const next = user.status === "active" ? "inactive" : "active";
    if (next === "inactive" && !(await confirm({ title: "Deactivate user?", message: `Deactivate ${user.name}? They will be signed out and unable to log in.`, confirmLabel: "Deactivate", danger: true }))) return;
    runAction(() => updateUser(user.id, { status: next }), `${user.name} is now ${next}.`);
  };

  const summary = [
    { title: "Total Users", value: totals.total, color: "text-blue-600" },
    { title: "Active Users", value: totals.active, color: "text-emerald-600" },
    { title: "Inactive Users", value: totals.inactive, color: "text-slate-600" },
    { title: "Administrators", value: totals.admins, color: "text-violet-600" },
  ];

  const editing = form?.user;
  const resetting = form?.resetFor;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create accounts, assign roles, and control who can sign in.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({})}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add User
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Users
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
          <h2 className="font-semibold text-slate-900">User Directory</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              aria-label="Search users"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter users by role"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter users by status"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {user.name}
                        {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.role?.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatLastLogin(user.lastLoginAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setForm({ user })}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ resetFor: user })}
                        className="ml-3 font-medium text-slate-600 hover:text-slate-900"
                      >
                        Reset password
                      </button>
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => toggleStatus(user)}
                          className={`ml-3 font-medium ${
                            user.status === "active" ? "text-red-600 hover:text-red-800" : "text-emerald-600 hover:text-emerald-800"
                          }`}
                        >
                          {user.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    {loading ? "Loading users..." : "No users match your search or filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {users.length} of {data?.total ?? 0} users
        </div>
      </section>

      {form && !editing && !resetting && (
        <FormModal
          title="Add User"
          submitLabel="Create User"
          fields={[
            { name: "name", label: "Full name" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Temporary password (min 8 characters)", type: "password" },
            { name: "roleId", label: "Role", type: "select", options: roleOptions },
          ]}
          onSubmit={async (values) => {
            await createUser(values);
            setMessage(`${values.name} can now sign in with the password you set. Share it securely.`);
            reload();
          }}
          onClose={() => setForm(null)}
        />
      )}

      {editing && (
        <FormModal
          title={`Edit ${editing.name}`}
          submitLabel="Save Changes"
          fields={[
            { name: "name", label: "Full name" },
            // You can't change your own role: it would be an easy way to lock yourself out.
            ...(editing.id === currentUser?.id
              ? []
              : [{ name: "roleId", label: "Role", type: "select", options: roleOptions }]),
          ]}
          initialValues={{ name: editing.name, roleId: editing.role?.id }}
          onSubmit={async (values) => {
            await updateUser(editing.id, values);
            reload();
          }}
          onClose={() => setForm(null)}
        />
      )}

      {resetting && (
        <FormModal
          title={`Reset password for ${resetting.name}`}
          submitLabel="Set Password"
          fields={[{ name: "password", label: "New password (min 8 characters)", type: "password" }]}
          onSubmit={async (values) => {
            await updateUser(resetting.id, values);
            setMessage(`Password changed for ${resetting.name}. Their old password no longer works.`);
          }}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
};

export default Users;
