import { useState } from "react"
import { Link } from "react-router-dom"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: "Dashboard", to: "/" },
    { label: "Finance", to: "/finance/ledger" },
    { label: "HR", to: "/hr/employees" },
    { label: "Projects", to: "/projects" },
  ]

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
          AMDox <span className="text-blue-600">ERP</span>
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign in
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-1 border-t border-slate-100 px-5 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar