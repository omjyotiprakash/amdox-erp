import { NavLink } from "react-router-dom"

const navigation = [
  { name: "Dashboard", path: "/", icon: "▦" },
  { name: "Finance", path: "/finance/ledger", icon: "₹" },
  { name: "Human Resources", path: "/hr/employees", icon: "♙" },
  { name: "Supply Chain", path: "/supply-chain/inventory", icon: "⇄" },
  { name: "Projects", path: "/projects", icon: "▤" },
  { name: "Reports", path: "/reports", icon: "▥" },
  { name: "Settings", path: "/settings/general", icon: "⚙" },
]



const Sidebar = () => {
  return (
    <aside className="flex w-full flex-col bg-slate-950 text-white md:min-h-screen md:w-64 md:shrink-0">
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">
          AMDox <span className="text-blue-400">ERP</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Enterprise Management
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-blue-600 font-medium text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="hidden border-t border-white/10 p-5 md:block">
        <p className="text-xs text-slate-500">AMDox ERP</p>
        <p className="mt-1 text-sm text-slate-300">
          Business management, simplified.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar