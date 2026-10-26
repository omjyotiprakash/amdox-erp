import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "./Icons";

// The modules worth a one-tap shortcut. A person only gets the ones their role can view.
const MODULE_TABS = [
  { module: "finance", label: "Finance", to: "/finance/ledger", prefix: "/finance", icon: "finance" },
  { module: "hr", label: "HR", to: "/hr/employees", prefix: "/hr", icon: "hr" },
  { module: "supplyChain", label: "Supply", to: "/supply-chain/inventory", prefix: "/supply-chain", icon: "supplyChain" },
  { module: "projects", label: "Projects", to: "/projects", prefix: "/projects", icon: "projects" },
];

const MAX_MODULE_TABS = 2; // Home + My Profile + 2 modules + Menu = 5, the most a thumb can comfortably reach

// App-style tab bar pinned to the bottom of a phone screen. Hidden on tablets and desktops,
// where the sidebar is always visible.
const BottomNav = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const tabs = [
    { label: "Home", to: "/", icon: "home", end: true },
    { label: "Profile", to: "/me", icon: "user" },
    ...MODULE_TABS.filter((tab) => user?.role?.permissions?.[tab.module]?.view).slice(0, MAX_MODULE_TABS),
  ];

  const linkClass = (active) =>
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition ${
      active ? "text-blue-600" : "text-slate-500"
    }`;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((tab) => {
        // a module tab stays highlighted anywhere inside that module (e.g. Payroll under HR)
        const active = tab.end ? pathname === "/" : pathname.startsWith(tab.prefix || tab.to);
        return (
          <Link key={tab.label} to={tab.to} className={linkClass(active)} aria-current={active ? "page" : undefined}>
            <Icon name={tab.icon} />
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}

      <button type="button" onClick={onMenuClick} className={linkClass(false)} aria-label="Open full menu">
        <Icon name="menu" />
        <span>Menu</span>
      </button>
    </nav>
  );
};

export default BottomNav;
