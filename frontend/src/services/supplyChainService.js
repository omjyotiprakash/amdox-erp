import api, { query } from "./api";

// Inventory
export const fetchInventory = (params) => api.get(`/supply-chain/inventory${query(params)}`);
export const createProduct = (body) => api.post("/supply-chain/inventory", body);
export const updateProduct = (id, body) => api.put(`/supply-chain/inventory/${id}`, body);
export const updateStock = (id, quantity) => api.patch(`/supply-chain/inventory/${id}/stock`, { quantity });
export const deleteProduct = (id) => api.delete(`/supply-chain/inventory/${id}`);

// Vendors
export const fetchVendors = (params) => api.get(`/supply-chain/vendors${query(params)}`);
export const createVendor = (body) => api.post("/supply-chain/vendors", body);
export const updateVendor = (id, body) => api.put(`/supply-chain/vendors/${id}`, body);
export const deleteVendor = (id) => api.delete(`/supply-chain/vendors/${id}`);

// Purchase orders
export const fetchPurchaseOrders = (params) => api.get(`/supply-chain/purchase-orders${query(params)}`);
export const createPurchaseOrder = (body) => api.post("/supply-chain/purchase-orders", body);
export const setPurchaseOrderStatus = (id, status) =>
  api.patch(`/supply-chain/purchase-orders/${id}/status`, { status });
export const deletePurchaseOrder = (id) => api.delete(`/supply-chain/purchase-orders/${id}`);

// Forecasting
export const fetchForecast = (params) => api.get(`/supply-chain/forecasting${query(params)}`);
