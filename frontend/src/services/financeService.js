import api from "./api";

// Builds "?a=1&b=2", skipping empty values and the "All" filter placeholder.
const query = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      search.set(key, value);
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

// General ledger
export const fetchLedger = (params) => api.get(`/finance/ledger${query(params)}`);
export const createTransaction = (body) => api.post("/finance/ledger", body);
export const deleteTransaction = (id) => api.delete(`/finance/ledger/${id}`);

// Accounts payable
export const fetchPayables = (params) => api.get(`/finance/payables${query(params)}`);
export const createPayable = (body) => api.post("/finance/payables", body);
export const payPayable = (id) => api.patch(`/finance/payables/${id}/pay`);
export const deletePayable = (id) => api.delete(`/finance/payables/${id}`);

// Accounts receivable
export const fetchReceivables = (params) => api.get(`/finance/receivables${query(params)}`);
export const createReceivable = (body) => api.post("/finance/receivables", body);
export const payReceivable = (id) => api.patch(`/finance/receivables/${id}/pay`);
export const deleteReceivable = (id) => api.delete(`/finance/receivables/${id}`);

// Reports
export const fetchFinanceReport = (months) => api.get(`/finance/reports/summary${query({ months })}`);
