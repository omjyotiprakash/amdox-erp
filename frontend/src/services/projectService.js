import api, { query } from "./api";

// Projects
export const fetchProjects = (params) => api.get(`/projects${query(params)}`);
export const fetchProject = (id) => api.get(`/projects/${id}`);
export const createProject = (body) => api.post("/projects", body);
export const updateProject = (id, body) => api.put(`/projects/${id}`, body);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Milestones
export const addMilestone = (projectId, body) => api.post(`/projects/${projectId}/milestones`, body);
export const setMilestoneStatus = (projectId, milestoneId, status) =>
  api.patch(`/projects/${projectId}/milestones/${milestoneId}`, { status });
export const deleteMilestone = (projectId, milestoneId) =>
  api.delete(`/projects/${projectId}/milestones/${milestoneId}`);

// Resource planning
export const fetchResources = (params) => api.get(`/projects/resources${query(params)}`);
export const assignResource = (body) => api.put("/projects/resources/assign", body);
export const unassignResource = (assignmentId) => api.delete(`/projects/resources/assignments/${assignmentId}`);
