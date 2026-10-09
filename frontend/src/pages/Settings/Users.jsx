
import { useState } from "react";

const initialUsers = [
  {
    id: "USR-1001",
    name: "Rahul Sharma",
    email: "rahul@amdox.example",
    role: "Administrator",
    department: "Management",
    status: "Active",
    lastLogin: "2026-10-09",
  },
  {
    id: "USR-1002",
    name: "Priya Das",
    email: "priya@amdox.example",
    role: "Finance Manager",
    department: "Finance",
    status: "Active",
    lastLogin: "2026-10-08",
  },
  {
    id: "USR-1003",
    name: "Amit Kumar",
    email: "amit@amdox.example",
    role: "HR Manager",
    department: "Human Resources",
    status: "Active",
    lastLogin: "2026-10-07",
  },
  {
    id: "USR-1004",
    name: "Sneha Patel",
    email: "sneha@amdox.example",
    role: "Inventory Manager",
    department: "Supply Chain",
    status: "Inactive",
    lastLogin: "2026-09-20",
  },
  {
    id: "USR-1005",
    name: "Arjun Singh",
    email: "arjun@amdox.example",
    role: "Employee",
    department: "Engineering",
    status: "Active",
    lastLogin: "2026-10-09",
  },
  {
    id: "USR-1006",
    name: "Neha Mishra",
    email: "neha@amdox.example",
    role: "Employee",
    department: "Engineering",
    status: "Pending",
    lastLogin: "Never",
  },
];

const roles = [
  "Administrator",
  "Finance Manager",
  "HR Manager",
  "Inventory Manager",
  "Employee",
];

const departments = [
  "Management",
  "Finance",
  "Human Resources",
  "Supply Chain",
  "Engineering",
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");

  const emptyForm = {
    name: "",
    email: "",
    role: "Employee",
    department: "Engineering",
    status: "Pending",
  };

  const [newUser, setNewUser] = useState(emptyForm);

  const activeCount = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveCount = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const pendingCount = users.filter(
    (user) => user.status === "Pending"
  ).length;

  const filteredUsers = users.filter((user) => {
    const searchText = `${user.id} ${user.name} ${user.email} ${user.department}`
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const updateUserField = (field, value) => {
    setEditingUser((previous) => ({ ...previous, [field]: value }));
  };

  const saveUser = (event) => {
    event.preventDefault();

    if (!editingUser.name.trim()) {
      window.alert("Please enter the user's name.");
      return;
    }

    const duplicateEmail = users.some(
      (user) =>
        user.id !== editingUser.id &&
        user.email.toLowerCase() === editingUser.email.trim().toLowerCase()
    );

    if (duplicateEmail) {
      window.alert("A user with this email address already exists.");
      return;
    }

    setUsers((previous) =>
      previous.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              ...editingUser,
              name: editingUser.name.trim(),
              email: editingUser.email.trim(),
            }
          : user
      )
    );

    setMessage(`Updated ${editingUser.name.trim()}.`);
    setEditingUser(null);
  };

  const addUser = (event) => {
    event.preventDefault();

    const name = newUser.name.trim();
    const email = newUser.email.trim().toLowerCase();

    if (!name || !email) {
      window.alert("Please enter a name and email address.");
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === email)) {
      window.alert("A user with this email address already exists.");
      return;
    }

    const user = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name,
      email,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
      lastLogin: "Never",
    };

    setUsers((previous) => [user, ...previous]);
    setNewUser(emptyForm);
    setShowAddForm(false);
    setMessage(`Added ${name} to the demo user directory.`);
  };

  const toggleUserStatus = (user) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";

    if (
      !window.confirm(
        `${nextStatus === "Active" ? "Activate" : "Deactivate"} ${user.name}?`
      )
    ) {
      return;
    }

    setUsers((previous) =>
      previous.map((item) =>
        item.id === user.id ? { ...item, status: nextStatus } : item
      )
    );

    setMessage(`${user.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const statusStyle = (status) => {
    if (status === "Active") return "bg-emerald-50 text-emerald-700";
    if (status === "Pending") return "bg-amber-50 text-amber-700";
    return "bg-red-50 text-red-700";
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500";

  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage user accounts, departments, roles, and access status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Users
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddForm((previous) => !previous);
              setEditingUser(null);
              setMessage("");
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {showAddForm ? "Cancel" : "+ Add User"}
          </button>
        </div>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Users",
            value: users.length,
            color: "text-blue-600",
          },
          {
            title: "Active Users",
            value: activeCount,
            color: "text-emerald-600",
          },
          {
            title: "Inactive Users",
            value: inactiveCount,
            color: "text-red-600",
          },
          {
            title: "Pending Activation",
            value: pendingCount,
            color: "text-amber-600",
          },
        ].map((item) => (
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

      {(showAddForm || editingUser) && (
        <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {editingUser
              ? "Update the selected user's information."
              : "Create a sample user entry for the directory."}
          </p>

          <form
            onSubmit={editingUser ? saveUser : addUser}
            className="mt-5 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Full Name
                <input
                  required
                  value={editingUser ? editingUser.name : newUser.name}
                  onChange={(event) =>
                    editingUser
                      ? updateUserField("name", event.target.value)
                      : setNewUser((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                  }
                  className={inputClass}
                  placeholder="Enter full name"
                />
              </label>

              <label className={labelClass}>
                Email Address
                <input
                  required
                  type="email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(event) =>
                    editingUser
                      ? updateUserField("email", event.target.value)
                      : setNewUser((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                  }
                  className={inputClass}
                  placeholder="name@example.com"
                />
              </label>

              <label className={labelClass}>
                Role
                <select
                  value={editingUser ? editingUser.role : newUser.role}
                  onChange={(event) =>
                    editingUser
                      ? updateUserField("role", event.target.value)
                      : setNewUser((previous) => ({
                          ...previous,
                          role: event.target.value,
                        }))
                  }
                  className={inputClass}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Department
                <select
                  value={
                    editingUser ? editingUser.department : newUser.department
                  }
                  onChange={(event) =>
                    editingUser
                      ? updateUserField("department", event.target.value)
                      : setNewUser((previous) => ({
                          ...previous,
                          department: event.target.value,
                        }))
                  }
                  className={inputClass}
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              {editingUser && (
                <label className={labelClass}>
                  Account Status
                  <select
                    value={editingUser.status}
                    onChange={(event) =>
                      updateUserField("status", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                  </select>
                </label>
              )}

              {!editingUser && (
                <label className={labelClass}>
                  Initial Status
                  <select
                    value={newUser.status}
                    onChange={(event) =>
                      setNewUser((previous) => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option>Pending</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingUser ? "Save Changes" : "Create User"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setShowAddForm(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">User Directory</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, department..."
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
                <option key={role} value={role}>
                  {role}
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs text-slate-400">{user.id}</p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {user.department}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {user.lastLogin}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser({ ...user });
                          setShowAddForm(false);
                          setMessage("");
                        }}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      {user.status !== "Pending" && (
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user)}
                          className={
                            user.status === "Active"
                              ? "font-medium text-red-600 hover:text-red-800"
                              : "font-medium text-emerald-600 hover:text-emerald-800"
                          }
                        >
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No users match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredUsers.length} of {users.length} sample users
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-400">
        Demo only: users and status changes are stored in component state and
        reset on refresh. This page does not create real accounts, send
        invitations, or enforce permissions.
      </p>
    </div>
  );
};

export default Users;
