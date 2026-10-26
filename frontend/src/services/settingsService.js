import api, { query } from "./api";

// General settings
export const fetchSettings = () => api.get("/settings/general");
export const saveSettings = (body) => api.put("/settings/general", body);

// Integrations
export const fetchIntegrations = () => api.get("/settings/integrations");
export const setIntegrationEnabled = (key, enabled) => api.put(`/settings/integrations/${key}`, { enabled });

// Roles and permissions
export const fetchRoles = (params) => api.get(`/settings/roles${query(params)}`);
export const createRole = (body) => api.post("/settings/roles", body);
export const saveRolePermissions = (id, permissions) => api.put(`/settings/roles/${id}/permissions`, { permissions });
export const deleteRole = (id) => api.delete(`/settings/roles/${id}`);

// Audit log
export const fetchAuditLog = (params) => api.get(`/settings/audit${query(params)}`);

// Users
export const fetchUsers = (params) => api.get(`/settings/users${query(params)}`);
export const createUser = (body) => api.post("/settings/users", body);
export const updateUser = (id, body) => api.put(`/settings/users/${id}`, body);
