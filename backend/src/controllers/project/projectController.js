const projectService = require("../../services/project/projectService");

const list = async (req, res) => {
  const { search, status, page, limit } = req.query;
  res.json({ success: true, data: await projectService.list({ search, status, page, limit }) });
};

const get = async (req, res) => {
  res.json({ success: true, data: await projectService.get(req.params.id) });
};

const create = async (req, res) => {
  const project = await projectService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: { project } });
};

const update = async (req, res) => {
  const project = await projectService.update(req.params.id, req.body);
  res.json({ success: true, data: { project } });
};

const remove = async (req, res) => {
  await projectService.remove(req.params.id);
  res.json({ success: true, data: {} });
};

const addMilestone = async (req, res) => {
  const project = await projectService.addMilestone(req.params.id, req.body);
  res.status(201).json({ success: true, data: { project } });
};

const setMilestoneStatus = async (req, res) => {
  const project = await projectService.setMilestoneStatus(req.params.id, req.params.milestoneId, req.body.status);
  res.json({ success: true, data: { project } });
};

const removeMilestone = async (req, res) => {
  const project = await projectService.removeMilestone(req.params.id, req.params.milestoneId);
  res.json({ success: true, data: { project } });
};

module.exports = { list, get, create, update, remove, addMilestone, setMilestoneStatus, removeMilestone };
