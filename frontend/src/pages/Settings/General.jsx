
import { useState } from "react";

const initialSettings = {
  companyName: "AMDox ERP",
  legalName: "AMDox Technologies Pvt. Ltd.",
  email: "admin@amdox.example",
  phone: "+91 98765 43210",
  website: "https://www.amdox.example",
  address: "Bhubaneswar, Odisha, India",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  language: "English",
  emailNotifications: true,
  lowStockAlerts: true,
  weeklyReports: false,
};

const General = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [savedMessage, setSavedMessage] = useState("");

  const updateField = (field, value) => {
    setSettings((previous) => ({ ...previous, [field]: value }));
    setSavedMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!settings.companyName.trim()) {
      window.alert("Company name is required.");
      return;
    }

    if (
      settings.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)
    ) {
      window.alert("Please enter a valid email address.");
      return;
    }

    setSavedSettings({ ...settings });
    setSavedMessage("Settings saved for this session.");
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all settings to their original demo values?"
    );

    if (!confirmed) return;

    setSettings({ ...initialSettings });
    setSavedSettings({ ...initialSettings });
    setSavedMessage("Settings have been reset.");
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            General Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure company details, regional preferences, and notifications.
          </p>
        </div>

        <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
          Administrator
        </span>
      </div>

      {savedMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {savedMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">Company Information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Basic information about your organization.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <label className={labelClass}>
              Company Display Name *
              <input
                required
                value={settings.companyName}
                onChange={(event) =>
                  updateField("companyName", event.target.value)
                }
                className={inputClass}
                placeholder="Enter company name"
              />
            </label>

            <label className={labelClass}>
              Legal Business Name
              <input
                value={settings.legalName}
                onChange={(event) =>
                  updateField("legalName", event.target.value)
                }
                className={inputClass}
                placeholder="Enter legal name"
              />
            </label>

            <label className={labelClass}>
              Contact Email
              <input
                type="email"
                value={settings.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClass}
                placeholder="admin@example.com"
              />
            </label>

            <label className={labelClass}>
              Contact Phone
              <input
                type="tel"
                value={settings.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClass}
                placeholder="Enter phone number"
              />
            </label>

            <label className={labelClass}>
              Company Website
              <input
                type="url"
                value={settings.website}
                onChange={(event) =>
                  updateField("website", event.target.value)
                }
                className={inputClass}
                placeholder="https://example.com"
              />
            </label>

            <label className={labelClass}>
              Business Address
              <input
                value={settings.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                className={inputClass}
                placeholder="Enter business address"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Regional Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set the default language, timezone, and display formats.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <label className={labelClass}>
              Language
              <select
                value={settings.language}
                onChange={(event) =>
                  updateField("language", event.target.value)
                }
                className={inputClass}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Odia</option>
              </select>
            </label>

            <label className={labelClass}>
              Timezone
              <select
                value={settings.timezone}
                onChange={(event) =>
                  updateField("timezone", event.target.value)
                }
                className={inputClass}
              >
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="Europe/London">London Time</option>
              </select>
            </label>

            <label className={labelClass}>
              Default Currency
              <select
                value={settings.currency}
                onChange={(event) =>
                  updateField("currency", event.target.value)
                }
                className={inputClass}
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </label>

            <label className={labelClass}>
              Date Format
              <select
                value={settings.dateFormat}
                onChange={(event) =>
                  updateField("dateFormat", event.target.value)
                }
                className={inputClass}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </label>

            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-sm font-medium text-slate-700">
                Format Preview
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Currency:{" "}
                <span className="font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: settings.currency,
                    maximumFractionDigits: 2,
                  }).format(12500)}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Date:{" "}
                <span className="font-semibold text-slate-900">
                  {(() => {
                    const date = new Date(2026, 9, 9);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();

                    if (settings.dateFormat === "MM/DD/YYYY") {
                      return `${month}/${day}/${year}`;
                    }
                    if (settings.dateFormat === "YYYY-MM-DD") {
                      return `${year}-${month}-${day}`;
                    }
                    return `${day}/${month}/${year}`;
                  })()}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Preview only; these choices do not yet change formatting
                elsewhere in the application.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Notification Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose which alerts you would like to receive.
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-5 sm:px-6">
            {[
              {
                key: "emailNotifications",
                title: "Email Notifications",
                description: "Receive general account and system updates.",
              },
              {
                key: "lowStockAlerts",
                title: "Low Stock Alerts",
                description: "Get notified when inventory falls below its reorder level.",
              },
              {
                key: "weeklyReports",
                title: "Weekly Reports",
                description: "Receive a weekly summary of ERP activity.",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(event) =>
                    updateField(item.key, event.target.checked)
                  }
                  className="h-4 w-4 shrink-0 accent-blue-600"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset to Defaults
          </button>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </form>

      <p className="text-xs text-slate-400">
        Demo settings only. Preferences are held in page state and are not
        persisted to a database or browser storage.
      </p>
    </div>
  );
};

export default General;
