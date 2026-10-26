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

// Employees
export const fetchEmployees = (params) => api.get(`/hr/employees${query(params)}`);
export const createEmployee = (body) => api.post("/hr/employees", body);
export const updateEmployee = (id, body) => api.put(`/hr/employees/${id}`, body);
export const deleteEmployee = (id) => api.delete(`/hr/employees/${id}`);

// Attendance
export const fetchAttendance = (date) => api.get(`/hr/attendance${query({ date })}`);
export const markAttendance = (body) => api.put("/hr/attendance", body);

// Leave
export const fetchLeave = (params) => api.get(`/hr/leave${query(params)}`);
export const createLeave = (body) => api.post("/hr/leave", body);
export const decideLeave = (id, status) => api.patch(`/hr/leave/${id}/decision`, { status });
export const deleteLeave = (id) => api.delete(`/hr/leave/${id}`);

// Payroll
export const fetchPayroll = (params) => api.get(`/hr/payroll${query(params)}`);
export const generatePayroll = (month) => api.post("/hr/payroll/generate", { month });
export const setPayrollStatus = (id, status) => api.patch(`/hr/payroll/${id}/status`, { status });
