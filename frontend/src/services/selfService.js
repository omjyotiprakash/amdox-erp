import api, { query } from "./api";

// Everything here is limited to the signed-in person's own record.
export const fetchMyProfile = () => api.get("/me/profile");
export const fetchMyAttendance = (month) => api.get(`/me/attendance${query({ month })}`);
export const fetchMyLeave = () => api.get("/me/leave");
export const requestMyLeave = (body) => api.post("/me/leave", body);
export const cancelMyLeave = (id) => api.delete(`/me/leave/${id}`);
export const fetchMyPayslips = () => api.get("/me/payslips");
