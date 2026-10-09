import { useState } from "react"

const MFASetup = () => {
  const [verificationCode, setVerificationCode] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()

    setMessage(
      "Multi-factor authentication is not connected to the backend yet."
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3l8 4v5c0 4.5-3.1 7.5-8 9-4.9-1.5-8-4.5-8-9V7l8-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4"
            />
          </svg>
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Multi-Factor Authentication
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your verification code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="verificationCode"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Verification code
            </label>

            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={verificationCode}
              onChange={(event) => {
                setVerificationCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                );
                setMessage("");
              }}
              placeholder="Enter 6-digit code"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {message && (
            <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Verify Code
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Verification will be enabled when the authentication backend is
          connected.
        </p>
      </div>
    </div>
  )
}

export default MFASetup