
import { useState } from "react";

const initialInventory = [
  {
    id: "INV-1001",
    name: "Laptop - Dell Latitude",
    category: "Electronics",
    sku: "ELEC-001",
    quantity: 24,
    price: 65000,
    reorderLevel: 10,
  },
  {
    id: "INV-1002",
    name: "Wireless Mouse",
    category: "Accessories",
    sku: "ACC-001",
    quantity: 8,
    price: 800,
    reorderLevel: 15,
  },
  {
    id: "INV-1003",
    name: "Office Chair",
    category: "Furniture",
    sku: "FUR-001",
    quantity: 32,
    price: 5500,
    reorderLevel: 10,
  },
  {
    id: "INV-1004",
    name: "Mechanical Keyboard",
    category: "Accessories",
    sku: "ACC-002",
    quantity: 0,
    price: 2500,
    reorderLevel: 8,
  },
  {
    id: "INV-1005",
    name: "Monitor - 24 inch",
    category: "Electronics",
    sku: "ELEC-002",
    quantity: 12,
    price: 12000,
    reorderLevel: 5,
  },
  {
    id: "INV-1006",
    name: "Office Desk",
    category: "Furniture",
    sku: "FUR-002",
    quantity: 6,
    price: 8500,
    reorderLevel: 10,
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getStockStatus = (item) => {
  if (item.quantity === 0) return "Out of Stock";
  if (item.quantity <= item.reorderLevel) return "Low Stock";
  return "In Stock";
};

const Inventory = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const stockValue = inventory.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  const lowStockCount = inventory.filter(
    (item) => item.quantity > 0 && item.quantity <= item.reorderLevel
  ).length;

  const outOfStockCount = inventory.filter(
    (item) => item.quantity === 0
  ).length;

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = `${item.name} ${item.sku} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesStock =
      stockFilter === "All" || getStockStatus(item) === stockFilter;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const updateStock = (id) => {
    const input = window.prompt("Enter the new stock quantity:");

    if (input === null || input.trim() === "") return;

    const quantity = Number(input);

    if (!Number.isInteger(quantity) || quantity < 0) {
      window.alert("Please enter a valid whole number of 0 or more.");
      return;
    }

    setInventory((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const summary = [
    {
      title: "Total Products",
      value: inventory.length,
      color: "text-blue-600",
    },
    {
      title: "Total Units in Stock",
      value: totalUnits,
      color: "text-violet-600",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      color: "text-amber-600",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track stock levels, product quantities, and inventory value.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print Inventory
        </button>
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
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Estimated Inventory Value</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {formatCurrency(stockValue)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Calculated from sample quantities and unit prices.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Product Inventory</h2>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or SKU..."
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
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
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
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.sku}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.category}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.reorderLevel}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          status === "In Stock"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : status === "Low Stock"
                              ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                              : "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => updateStock(item.id)}
                        className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-800"
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredInventory.length} of {inventory.length} sample products
        </div>
      </section>
    </div>
  );
};

export default Inventory;
