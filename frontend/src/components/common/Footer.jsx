const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-5">
      <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} AMDox ERP. All rights reserved.
        </p>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <a href="#privacy" className="transition hover:text-blue-600">
            Privacy
          </a>
          <a href="#terms" className="transition hover:text-blue-600">
            Terms
          </a>
          <span className="text-slate-400">v1.0.0</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer