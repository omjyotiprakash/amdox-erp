
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { changePassword } from "../../services/authService";
import FormModal from "./FormModal";

const levelDot = {
  danger: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const Header = ({ onMenuClick }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items: notifications, count: notificationCount, reload: reloadNotifications } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative z-30 flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Open navigation"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            AMDox ERP
          </h1>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Enterprise Resource Planning
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (!notificationsOpen) reloadNotifications();
              setNotificationsOpen(!notificationsOpen);
            }}
            aria-expanded={notificationsOpen}
            aria-label="Toggle notifications"
            className="relative rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
          >
            <svg
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
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-72 max-w-[85vw] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <h2 className="font-semibold text-slate-900">
                Notifications
              </h2>
              {notifications.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  You're all caught up. Nothing needs your attention.
                </p>
              ) : (
                <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <Link
                        to={notification.link}
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-start gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${levelDot[notification.level]}`} />
                        <span>{notification.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="max-w-36 truncate text-sm font-semibold text-slate-900">
              {user?.name || "Administrator"}
            </p>
            <p className="max-w-36 truncate text-xs text-slate-500">
              {user?.email || "System Admin"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPasswordNotice("");
            setChangingPassword(true);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Change password
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Logout
        </button>
      </div>

      {passwordNotice && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {passwordNotice}
        </p>
      )}

      {changingPassword && (
        <FormModal
          title="Change password"
          submitLabel="Change password"
          fields={[
            { name: "currentPassword", label: "Current password", type: "password" },
            { name: "newPassword", label: "New password (min 8 characters)", type: "password" },
            { name: "confirmPassword", label: "Confirm new password", type: "password" },
          ]}
          onSubmit={async ({ currentPassword, newPassword, confirmPassword }) => {
            if (newPassword !== confirmPassword) throw new Error("The new passwords do not match.");
            await changePassword({ currentPassword, newPassword });
            setPasswordNotice("Password changed. Your other devices have been signed out.");
          }}
          onClose={() => setChangingPassword(false)}
        />
      )}
    </header>
  );
};

export default Header;
