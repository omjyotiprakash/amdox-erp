
import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", path: "/" },
  { name: "Ledger", path: "/finance/ledger" },
  { name: "Payables", path: "/finance/payables" },
  { name: "Receivables", path: "/finance/receivables" },
  { name: "Human Resources", path: "/hr/employees" },
  { name: "Attendance", path: "/hr/attendance" },
  { name: "Leave Management", path: "/hr/leave" },
  { name: "Payroll", path: "/hr/payroll" },
  { name: "Supply Chain", path: "/supply-chain/inventory" },
  { name: "Vendors", path: "/supply-chain/vendors" },
  { name: "Purchase Orders", path: "/supply-chain/purchase-orders" },
  { name: "Forecasting", path: "/supply-chain/forecasting" },
  { name: "Projects", path: "/projects" },
  { name: "Reports", path: "/reports" },
  { name: "Settings", path: "/settings/general" },
  { name: "Project Details", path: "/projects/details" },
  { name: "Resource Planning", path: "/projects/resources" },
  { name: "Integrations", path: "/settings/integrations" },
  { name: "Roles & Permissions", path: "/settings/roles" },
  { name: "User Management", path: "/settings/users" },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-30 md:h-screen md:w-64 md:max-w-none md:shrink-0 md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              AMDox <span className="text-blue-400">ERP</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Enterprise Management
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
            aria-label="Close navigation"
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
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-600 font-medium text-white"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-5">
          <p className="text-xs text-slate-500">AMDox ERP</p>
          <p className="mt-1 text-sm text-slate-300">
            Business management, simplified.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
