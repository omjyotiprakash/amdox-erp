import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { fetchForecast } from "../../services/supplyChainService";
import { formatCurrency } from "../../utils/formatters";

const Forecasting = () => {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [forecastPeriod, setForecastPeriod] = useState("1");

  const months = Number(forecastPeriod);
  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchForecast({ months, category: categoryFilter, search: debouncedSearch }),
    [months, categoryFilter, debouncedSearch]
  );

  const forecast = data?.items ?? [];
  const totals = data?.summary ?? { forecastedUnits: 0, productsToReorder: 0, totalShortfall: 0, estimatedValue: 0 };
  const categories = data?.categories ?? [];

  const summary = [
    {
      title: "Forecasted Units",
      value: totals.forecastedUnits.toLocaleString("en-IN"),
      color: "text-blue-600",
      note: `Next ${months} ${months === 1 ? "month" : "months"}`,
    },
    {
      title: "Products to Reorder",
      value: totals.productsToReorder,
      color: "text-amber-600",
      note: "Forecast demand exceeds current stock",
    },
    {
      title: "Potential Stock Shortfall",
      value: totals.totalShortfall.toLocaleString("en-IN"),
      color: "text-red-600",
      note: "Units needed beyond current stock",
    },
    {
      title: "Estimated Demand Value",
      value: formatCurrency(totals.estimatedValue),
      color: "text-emerald-600",
      note: "Forecast units at current unit prices",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demand Forecasting</h1>
          <p className="mt-1 text-sm text-slate-500">
            Projected demand from each product's monthly demand and expected growth. Set those on the{" "}
            <Link to="/supply-chain/inventory" className="font-medium text-blue-600 hover:underline">
              Inventory
            </Link>{" "}
            page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Forecast
        </button>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Product Demand Forecast</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search forecast"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={forecastPeriod}
              onChange={(event) => setForecastPeriod(event.target.value)}
              aria-label="Forecast period"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="1">Next month</option>
              <option value="3">Next 3 months</option>
              <option value="6">Next 6 months</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter forecast by category"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Current Stock</th>
                <th className="px-5 py-3">Monthly Demand</th>
                <th className="px-5 py-3">Forecasted Demand</th>
                <th className="px-5 py-3">Stock Shortfall</th>
                <th className="px-5 py-3">Demand Trend</th>
                <th className="px-5 py-3">Recommendation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {forecast.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.product}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{item.currentStock}</td>
                  <td className="px-5 py-4 text-slate-700">{item.monthlyDemand}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.predictedDemand}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        item.stockShortfall > 0
                          ? "font-semibold text-red-600"
                          : "font-medium text-emerald-600"
                      }
                    >
                      {item.stockShortfall}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={
                        item.demandGrowth > 0
                          ? "font-medium text-emerald-600"
                          : item.demandGrowth < 0
                            ? "font-medium text-red-600"
                            : "text-slate-500"
                      }
                    >
                      {item.demandGrowth > 0 ? "↑ " : item.demandGrowth < 0 ? "↓ " : ""}
                      {Math.abs(item.demandGrowth).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.stockShortfall > 0 ? (
                      <span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Reorder {item.stockShortfall}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Stock sufficient
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {forecast.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading forecast..."
                      : data?.total
                        ? "No products match your search or category."
                        : "No products yet. Add products on the Inventory page to see a forecast."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {forecast.length} of {data?.total ?? 0} products. This is a rule-based projection, not a machine-learning forecast.
        </div>
      </section>
    </div>
  );
};

export default Forecasting;
