import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { changePassword } from "../../services/authService";
import FormModal from "./FormModal";
import Icon from "./Icons";
import Sheet from "./Sheet";

const levelDot = {
  danger: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const Header = ({ onMenuClick }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items: notifications, count: notificationCount, reload: reloadNotifications } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const openChangePassword = () => {
    setMenuOpen(false);
    setPasswordNotice("");
    setChangingPassword(true);
  };

  const initial = (user?.name || "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">AMDox ERP</h1>
          <p className="hidden text-sm text-slate-500 sm:block">Enterprise Resource Planning</p>
        </div>

        {/* notifications: a dropdown on big screens, a panel pinned under the header on phones */}
        <div className="sm:relative">
          <button
            type="button"
            onClick={() => {
              if (!notificationsOpen) reloadNotifications();
              setNotificationsOpen(!notificationsOpen);
            }}
            aria-expanded={notificationsOpen}
            aria-label="Toggle notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <Icon name="bell" className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} aria-hidden="true" />
              <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.25rem)] z-50 max-h-[70dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-w-[85vw]">
                <h2 className="font-semibold text-slate-900">Notifications</h2>
                {notifications.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">You're all caught up. Nothing needs your attention.</p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <Link
                          to={notification.link}
                          onClick={() => setNotificationsOpen(false)}
                          className="flex items-start gap-3 rounded-xl px-2 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${levelDot[notification.level]}`} />
                          <span>{notification.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* big screens: name, email and the two buttons inline */}
        <div className="hidden min-w-0 items-center gap-3 border-l border-slate-200 pl-4 md:flex">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="max-w-36 truncate text-sm font-semibold text-slate-900">{user?.name || "Administrator"}</p>
            <p className="max-w-36 truncate text-xs text-slate-500">{user?.email || "System Admin"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={openChangePassword}
          className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:block"
        >
          Change password
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 md:block"
        >
          Logout
        </button>

        {/* phones: tap the avatar for the same actions */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open account menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 md:hidden"
        >
          {initial}
        </button>
      </div>

      {passwordNotice && (
        <p role="status" className="mx-4 mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:mx-6 lg:mx-8">
          {passwordNotice}
        </p>
      )}

      {menuOpen && (
        <Sheet label="Account" onClose={() => setMenuOpen(false)}>
          <div className="flex items-center gap-3 px-5 pb-3 pt-1 sm:pt-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
              {user?.role?.name && <p className="mt-0.5 text-xs text-slate-400">{user.role.name}</p>}
            </div>
          </div>

          <div className="space-y-2 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            <Link
              to="/me"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl border border-slate-200 px-4 py-3.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              My Profile
            </Link>
            <button
              type="button"
              onClick={openChangePassword}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Change password
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-xl bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </Sheet>
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
