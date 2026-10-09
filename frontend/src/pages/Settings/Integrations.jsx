
import { useState } from "react";

const initialIntegrations = [
  {
    id: 1,
    name: "MongoDB Atlas",
    category: "Database",
    description: "Cloud database for storing application data.",
    icon: "DB",
    status: "Connected",
    featured: true,
  },
  {
    id: 2,
    name: "Stripe",
    category: "Payments",
    description: "Payment processing for online transactions.",
    icon: "ST",
    status: "Disconnected",
    featured: true,
  },
  {
    id: 3,
    name: "Google Workspace",
    category: "Productivity",
    description: "Connect business email and productivity services.",
    icon: "GW",
    status: "Connected",
    featured: false,
  },
  {
    id: 4,
    name: "Slack",
    category: "Communication",
    description: "Send project updates and notifications to channels.",
    icon: "SL",
    status: "Disconnected",
    featured: false,
  },
  {
    id: 5,
    name: "Microsoft Teams",
    category: "Communication",
    description: "Coordinate teams and receive workflow notifications.",
    icon: "MT",
    status: "Disconnected",
    featured: false,
  },
  {
    id: 6,
    name: "GitHub",
    category: "Development",
    description: "Connect repositories and track development activity.",
    icon: "GH",
    status: "Connected",
    featured: false,
  },
];

const Integrations = () => {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const connectedCount = integrations.filter(
    (integration) => integration.status === "Connected"
  ).length;

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = `${integration.name} ${integration.description} ${integration.category}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || integration.category === categoryFilter;

    const matchesConnection =
      !showConnectedOnly || integration.status === "Connected";

    return matchesSearch && matchesCategory && matchesConnection;
  });

  const toggleConnection = (integration) => {
    setSavedMessage("");

    if (integration.status === "Connected") {
      const confirmed = window.confirm(
        `Disconnect ${integration.name}?`
      );

      if (!confirmed) return;

      setIntegrations((previous) =>
        previous.map((item) =>
          item.id === integration.id
            ? { ...item, status: "Disconnected" }
            : item
        )
      );

      setSavedMessage(`${integration.name} marked as disconnected.`);
      return;
    }

    setSelectedIntegration(integration);
    setApiKey("");
  };

  const confirmConnection = (event) => {
    event.preventDefault();

    if (
      ["MongoDB Atlas", "Stripe"].includes(selectedIntegration.name) &&
      !apiKey.trim()
    ) {
      window.alert("Enter a demo credential to continue.");
      return;
    }

    setIntegrations((previous) =>
      previous.map((item) =>
        item.id === selectedIntegration.id
          ? { ...item, status: "Connected" }
          : item
      )
    );

    setSavedMessage(
      `${selectedIntegration.name} marked as connected in this demo.`
    );
    setSelectedIntegration(null);
    setApiKey("");
  };

  const categories = [
    "All",
    ...new Set(integrations.map((item) => item.category)),
  ];

  const statusStyle = (status) =>
    status === "Connected"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage third-party services connected to your ERP platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCategoryFilter("All");
            setShowConnectedOnly(false);
            setSavedMessage("Integration list refreshed.");
          }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh List
        </button>
      </div>

      {savedMessage && (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
        >
          {savedMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available Integrations</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {integrations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Connected</p>
          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {connectedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Not Connected</p>
          <p className="mt-3 text-2xl font-bold text-amber-600">
            {integrations.length - connectedCount}
          </p>
        </div>
      </div>

      {selectedIntegration && (
        <form
          onSubmit={confirmConnection}
          className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="font-semibold text-slate-900">
              Connect {selectedIntegration.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This demo changes the displayed status only. It does not
              authenticate with the external service.
            </p>
          </div>

          {["MongoDB Atlas", "Stripe"].includes(
            selectedIntegration.name
          ) && (
            <label className="block text-sm font-medium text-slate-700">
              Demo credential
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Enter any non-empty demo value"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 sm:max-w-md"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Do not enter a real API key or password.
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Confirm Demo Connection
            </button>
            <button
              type="button"
              onClick={() => setSelectedIntegration(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-semibold text-slate-900">
            Integration Directory
          </h2>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showConnectedOnly}
              onChange={(event) =>
                setShowConnectedOnly(event.target.checked)
              }
              className="h-4 w-4 accent-blue-600"
            />
            Show connected only
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
              key={integration.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                  {integration.icon}
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(
                    integration.status
                  )}`}
                >
                  {integration.status}
                </span>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {integration.name}
                  </h3>
                  {integration.featured && (
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Featured
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  {integration.category}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {integration.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleConnection(integration)}
                className={
                  integration.status === "Connected"
                    ? "mt-5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    : "mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                }
              >
                {integration.status === "Connected" ? "Disconnect" : "Connect"}
              </button>
            </article>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <p className="font-medium text-slate-700">
              No integrations found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-400">
        Demo mode: connection statuses are illustrative and reset on page
        reload. No third-party API connections or credentials are created.
      </p>
    </div>
  );
};

export default Integrations;
