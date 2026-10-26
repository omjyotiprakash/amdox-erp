const Role = require("../../models/Role");
const User = require("../../models/User");
const { MODULES, ACTIONS, emptyPermissions } = require("../../models/Permission");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

const plain = (role, users) => ({ ...role.toJSON(), users });

const withUserCounts = async (roles) => {
  const counts = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
  return roles.map((role) => plain(role, counts.find((row) => String(row._id) === role.id)?.count || 0));
};

const list = async ({ search }) => {
  const clause = searchFilter(search, ["name", "description"]);
  const [roles, total] = await Promise.all([Role.find(clause || {}).sort({ createdAt: 1 }), Role.countDocuments()]);
  const items = await withUserCounts(roles);
  return {
    items,
    total,
    modules: MODULES,
    actions: ACTIONS,
    summary: { total, assignedUsers: items.reduce((sum, role) => sum + role.users, 0), modules: MODULES.length },
  };
};

const duplicateName = (err) => {
  if (err.code === 11000) throw new AppError(409, "A role with this name already exists");
  throw err;
};

const create = async ({ name, description }) => {
  try {
    const role = await Role.create({ name, description, permissions: emptyPermissions() }); // nothing granted until configured
    return plain(role, 0);
  } catch (err) {
    return duplicateName(err);
  }
};

const updatePermissions = async (id, permissions) => {
  const role = await Role.findById(id);
  if (!role) throw new AppError(404, "Role not found");
  if (role.name === "Admin") throw new AppError(400, "The Admin role always has full access and cannot be changed");

  for (const module of MODULES) {
    for (const action of ACTIONS) role.set(`permissions.${module}.${action}`, Boolean(permissions[module]?.[action]));
  }
  await role.save();
  return (await withUserCounts([role]))[0];
};

const remove = async (id) => {
  const role = await Role.findById(id);
  if (!role) throw new AppError(404, "Role not found");
  if (role.isSystem) throw new AppError(400, "Built-in roles cannot be deleted");
  if (await User.exists({ role: id })) throw new AppError(409, "This role is assigned to users. Move them to another role first.");
  await role.deleteOne();
};

module.exports = { list, create, updatePermissions, remove };
