import { Link, useLocation } from "react-router-dom"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"

const Error = () => {
  const location = useLocation()
  const message = location.state?.message

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Something went wrong
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Unable to complete your request
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            {message ||
              "An unexpected error occurred. Please try again or return to your dashboard."}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Try again
            </button>

            <Link
              to="/"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Error