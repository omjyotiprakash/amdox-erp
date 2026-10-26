// Permission catalogue shared by roles and the authorize() middleware.
const MODULES = ["dashboard", "finance", "hr", "supplyChain", "projects", "reports", "settings"];
const ACTIONS = ["view", "create", "edit", "delete"];

const emptyPermissions = () =>
  Object.fromEntries(MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, false]))]));

const buildPermissions = (grants = {}) => {
  const permissions = emptyPermissions();
  for (const [module, actions] of Object.entries(grants)) {
    for (const action of actions) permissions[module][action] = true;
  }
  return permissions;
};

module.exports = { MODULES, ACTIONS, emptyPermissions, buildPermissions };
