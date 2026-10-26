import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useFetch } from "../../hooks/useFetch";
import { fetchIntegrations, setIntegrationEnabled } from "../../services/settingsService";
import { useConfirm } from "../../context/ConfirmContext";

const statusStyle = (enabled) =>
  enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600";

const Integrations = () => {
  const confirm = useConfirm();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const { data, loading, error, reload } = useFetch(fetchIntegrations, []);
  const integrations = data?.items ?? [];
  const enabledCount = integrations.filter((integration) => integration.enabled).length;

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = `${integration.name} ${integration.description} ${integration.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || integration.category === categoryFilter;
    const matchesStatus = !showEnabledOnly || integration.enabled;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ["All", ...new Set(integrations.map((item) => item.category))];

  const toggle = async (integration) => {
    setActionError("");
    setMessage("");

    if (integration.enabled && !(await confirm({ title: "Turn off integration?", message: `Turn off ${integration.name}?`, confirmLabel: "Turn off" }))) return;

    try {
      await setIntegrationEnabled(integration.key, !integration.enabled);
      setMessage(`${integration.name} ${integration.enabled ? "turned off" : "turned on"}.`);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose which third-party services your workspace uses.
        </p>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Turning an integration on records it for your workspace. It does not store passwords or API
        keys, and no data is exchanged with the service yet. Live connections are configured on the
        server.
      </p>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      {message && (
        <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available Integrations</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{integrations.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Turned On</p>
          <p className="mt-3 text-2xl font-bold text-emerald-600">{enabledCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Turned Off</p>
          <p className="mt-3 text-2xl font-bold text-amber-600">{integrations.length - enabledCount}</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-semibold text-slate-900">Integration Directory</h2>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showEnabledOnly}
              onChange={(event) => setShowEnabledOnly(event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Show turned on only
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search integrations..."
            aria-label="Search integrations"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by integration category"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All categories" : category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredIntegrations.map((integration) => (
            <article
              key={integration.key}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                  {integration.icon}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(integration.enabled)}`}>
                  {integration.enabled ? "On" : "Off"}
                </span>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                  {integration.featured && (
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">{integration.category}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{integration.description}</p>
              </div>

              <button
                type="button"
                onClick={() => toggle(integration)}
                disabled={integration.locked}
                className={
                  integration.enabled
                    ? "mt-5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    : "mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                }
              >
                {integration.locked ? "Always on" : integration.enabled ? "Turn off" : "Turn on"}
              </button>
            </article>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <p className="font-medium text-slate-700">
              {loading ? "Loading integrations..." : "No integrations found"}
            </p>
            {!loading && (
              <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Integrations;
