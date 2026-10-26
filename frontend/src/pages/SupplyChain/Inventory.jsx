import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import FormModal from "../../components/common/FormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import {
  createProduct,
  deleteProduct,
  fetchInventory,
  updateProduct,
  updateStock,
} from "../../services/supplyChainService";
import { formatCurrency } from "../../utils/formatters";

const stockStyle = {
  "In Stock": "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
  "Low Stock": "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
  "Out of Stock": "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700",
};

const productFields = [
  { name: "name", label: "Product name", placeholder: "e.g. Wireless Mouse" },
  { name: "category", label: "Category", placeholder: "e.g. Accessories" },
  { name: "sku", label: "SKU", placeholder: "e.g. ACC-001" },
  { name: "quantity", label: "Quantity in stock", type: "number", step: "1", min: "0" },
  { name: "price", label: "Unit price (INR)", type: "number", min: "0" },
  { name: "reorderLevel", label: "Reorder level", type: "number", step: "1", min: "0" },
  { name: "monthlyDemand", label: "Average monthly demand (units)", type: "number", step: "1", min: "0" },
  { name: "demandGrowth", label: "Expected demand growth (%)", type: "number", step: "0.1", min: "-100" },
];

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [form, setForm] = useState(null); // null | { product? }
  const [stockItem, setStockItem] = useState(null);
  const [actionError, setActionError] = useState("");

  const debouncedSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => fetchInventory({ search: debouncedSearch, category: categoryFilter, stock: stockFilter }),
    [debouncedSearch, categoryFilter, stockFilter]
  );

  const inventory = data?.items ?? [];
  const totals = data?.summary ?? { total: 0, totalUnits: 0, stockValue: 0, lowStock: 0, outOfStock: 0 };
  const categories = data?.categories ?? [];

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name} (${item.code})?`)) return;
    setActionError("");
    try {
      await deleteProduct(item.id);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const summary = [
    { title: "Total Products", value: totals.total, color: "text-blue-600" },
    { title: "Total Units in Stock", value: totals.totalUnits.toLocaleString("en-IN"), color: "text-violet-600" },
    { title: "Low Stock Items", value: totals.lowStock, color: "text-amber-600" },
    { title: "Out of Stock", value: totals.outOfStock, color: "text-red-600" },
  ];

  const editing = form?.product;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor stock levels, product value, and reorder requirements.
            {totals.total > 0 && ` Stock value: ${formatCurrency(totals.stockValue)}.`}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({})}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Product
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Inventory
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <ErrorBanner message={actionError} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className={`mt-3 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Product Inventory</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, SKU, category..."
              aria-label="Search inventory"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              aria-label="Filter by stock status"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All stock statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Reorder Level</th>
                <th className="px-5 py-3">Unit Price</th>
                <th className="px-5 py-3">Stock Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.sku} · {item.code}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.category}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{item.quantity}</td>
                  <td className="px-5 py-4 text-slate-600">{item.reorderLevel}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={stockStyle[item.stockStatus]}>{item.stockStatus}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setStockItem(item)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Update stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ product: item })}
                      className="ml-3 font-medium text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="ml-3 font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {inventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading inventory..."
                      : data?.total
                        ? "No products match your search or filters."
                        : "No products yet. Click Add Product to create the first one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {inventory.length} of {data?.total ?? 0} products
        </div>
      </section>

      {form && (
        <FormModal
          title={editing ? `Edit ${editing.name}` : "Add Product"}
          submitLabel={editing ? "Save Changes" : "Add Product"}
          fields={productFields}
          initialValues={
            editing ?? { quantity: "0", price: "0", reorderLevel: "0", monthlyDemand: "0", demandGrowth: "0" }
          }
          onSubmit={async (values) => {
            if (editing) await updateProduct(editing.id, values);
            else await createProduct(values);
            reload();
          }}
          onClose={() => setForm(null)}
        />
      )}

      {stockItem && (
        <FormModal
          title={`Update stock: ${stockItem.name}`}
          submitLabel="Update Stock"
          fields={[{ name: "quantity", label: "New quantity", type: "number", step: "1", min: "0" }]}
          initialValues={{ quantity: String(stockItem.quantity) }}
          onSubmit={async ({ quantity }) => {
            await updateStock(stockItem.id, quantity);
            reload();
          }}
          onClose={() => setStockItem(null)}
        />
      )}
    </div>
  );
};

export default Inventory;
