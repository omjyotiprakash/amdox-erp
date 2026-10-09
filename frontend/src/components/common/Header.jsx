import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          AMDox ERP
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enterprise Resource Planning
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-expanded={notificationsOpen}
            className="relative rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
            aria-label="Toggle notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"
              />
            </svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <h2 className="font-semibold text-slate-900">Notifications</h2>
              <p className="mt-2 text-sm text-slate-500">
                You're all caught up. Notifications will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || "Administrator"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.email || "System Admin"}
            </p>
          </div>
        </div>
        <button
  type="button"
  onClick={handleLogout}
  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
>
  Logout
</button>
      </div>
    </header>
  )
}

export default Header