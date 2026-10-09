
import { useMemo, useState } from "react";

const forecastData = [
  {
    id: 1,
    product: "Dell Latitude Laptop",
    category: "Electronics",
    currentStock: 24,
    monthlyDemand: 18,
    predictedDemand: 25,
    unitPrice: 65000,
  },
  {
    id: 2,
    product: "Wireless Mouse",
    category: "Accessories",
    currentStock: 8,
    monthlyDemand: 20,
    predictedDemand: 28,
    unitPrice: 800,
  },
  {
    id: 3,
    product: "Office Chair",
    category: "Furniture",
    currentStock: 32,
    monthlyDemand: 12,
    predictedDemand: 15,
    unitPrice: 5500,
  },
  {
    id: 4,
    product: "Mechanical Keyboard",
    category: "Accessories",
    currentStock: 0,
    monthlyDemand: 14,
    predictedDemand: 22,
    unitPrice: 2500,
  },
  {
    id: 5,
    product: "24-inch Monitor",
    category: "Electronics",
    currentStock: 12,
    monthlyDemand: 10,
    predictedDemand: 13,
    unitPrice: 12000,
  },
  {
    id: 6,
    product: "Office Desk",
    category: "Furniture",
    currentStock: 6,
    monthlyDemand: 8,
    predictedDemand: 11,
    unitPrice: 8500,
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Forecasting = () => {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [forecastPeriod, setForecastPeriod] = useState("1");

  const months = Number(forecastPeriod);

  const forecast = useMemo(() => {
    return forecastData
      .filter((item) => {
        const matchesCategory =
          categoryFilter === "All" || item.category === categoryFilter;

        const matchesSearch = item.product
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .map((item) => {
        const predictedDemand = Math.round(item.predictedDemand * months);
        const stockShortfall = Math.max(
          0,
          predictedDemand - item.currentStock
        );
        const growth =
          ((item.predictedDemand - item.monthlyDemand) /
            Math.max(item.monthlyDemand, 1)) *
          100;

        return {
          ...item,
          predictedDemand,
          stockShortfall,
          growth,
          estimatedValue: predictedDemand * item.unitPrice,
        };
      });
  }, [categoryFilter, search, months]);

  const totalPredictedDemand = forecast.reduce(
    (sum, item) => sum + item.predictedDemand,
    0
  );

  const totalShortfall = forecast.reduce(
    (sum, item) => sum + item.stockShortfall,
    0
  );

  const estimatedDemandValue = forecast.reduce(
    (sum, item) => sum + item.estimatedValue,
    0
  );

  const productsToReorder = forecast.filter(
    (item) => item.stockShortfall > 0
  ).length;

  const summary = [
    {
      title: "Forecasted Units",
      value: totalPredictedDemand.toLocaleString("en-IN"),
      color: "text-blue-600",
      note: `Next ${months} ${months === 1 ? "month" : "months"}`,
    },
    {
      title: "Products to Reorder",
      value: productsToReorder,
      color: "text-amber-600",
      note: "Based on predicted demand",
    },
    {
      title: "Potential Stock Shortfall",
      value: totalShortfall.toLocaleString("en-IN"),
      color: "text-red-600",
      note: "Units needed beyond current stock",
    },
    {
      title: "Estimated Demand Value",
      value: formatCurrency(estimatedDemandValue),
      color: "text-emerald-600",
      note: "Based on sample unit prices",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Demand Forecasting
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Estimate future product demand and identify potential stock shortages.
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

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          Forecast overview
        </p>
        <p className="mt-1 text-sm leading-6 text-blue-800">
          These estimates use illustrative monthly demand figures and fixed
          growth assumptions. They are sample projections, not predictions
          generated from actual sales history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Forecast Configuration
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a projection period and product category.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search forecast products"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-sm"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Product Demand Forecast
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Compare current inventory with estimated future demand.
          </p>
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
                    <p className="font-medium text-slate-900">
                      {item.product}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.category}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {item.currentStock}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {item.monthlyDemand}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {item.predictedDemand}
                  </td>

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
                        item.growth > 0
                          ? "font-medium text-emerald-600"
                          : item.growth < 0
                            ? "font-medium text-red-600"
                            : "text-slate-500"
                      }
                    >
                      {item.growth > 0 ? "↑ " : item.growth < 0 ? "↓ " : ""}
                      {Math.abs(item.growth).toFixed(1)}%
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
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No products match your search or category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {forecast.length} of {forecastData.length} sample products
        </div>
      </section>
    </div>
  );
};

export default Forecasting;
