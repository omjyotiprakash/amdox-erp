const Employee = require("../../models/hr/Employee");
const Project = require("../../models/project/Project");
const Assignment = require("../../models/project/Resource");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

const HOURS_PER_WEEK = 40;

const statusOf = (allocation) => {
  if (allocation === 0) return "Unassigned";
  if (allocation >= 100) return "Fully Allocated";
  return "Available";
};

// Every non-inactive employee with their project assignments and total allocation.
const list = async ({ search, department, status }) => {
  const filter = { status: { $ne: "Inactive" } };
  if (department && department !== "All") filter.department = department;
  const clause = searchFilter(search, ["name", "code", "jobTitle", "department"]);
  if (clause) Object.assign(filter, clause);

  const [employees, everyone, assignments, projects, departments] = await Promise.all([
    Employee.find(filter).sort({ code: 1 }).limit(500),
    Employee.find({ status: { $ne: "Inactive" } }).select("_id"),
    Assignment.find().populate("project", "code name status"),
    Project.find({ status: { $nin: ["Completed", "Cancelled"] } }).select("code name").sort({ code: 1 }),
    Employee.distinct("department", { status: { $ne: "Inactive" } }),
  ]);

  const byEmployee = new Map();
  for (const assignment of assignments) {
    const key = assignment.employee.toString();
    if (!byEmployee.has(key)) byEmployee.set(key, []);
    byEmployee.get(key).push(assignment);
  }

  const build = (employee) => {
    const own = byEmployee.get(employee.id) || [];
    const allocation = own.reduce((sum, assignment) => sum + assignment.allocation, 0);
    return {
      employeeId: employee.id,
      code: employee.code,
      name: employee.name,
      jobTitle: employee.jobTitle,
      department: employee.department,
      allocation,
      hours: Math.round((allocation / 100) * HOURS_PER_WEEK),
      status: statusOf(allocation),
      assignments: own
        .filter((assignment) => assignment.project)
        .map((assignment) => ({
          id: assignment.id,
          allocation: assignment.allocation,
          project: { id: assignment.project.id, code: assignment.project.code, name: assignment.project.name },
        })),
    };
  };

  const items = employees.map(build).filter((row) => !status || status === "All" || row.status === status);
  const allocations = everyone.map((employee) => build(employee).allocation);

  return {
    items,
    total: everyone.length,
    departments: departments.sort(),
    projects,
    summary: {
      total: everyone.length,
      assigned: allocations.filter((value) => value > 0).length,
      partiallyAvailable: allocations.filter((value) => value > 0 && value < 100).length,
      unassigned: allocations.filter((value) => value === 0).length,
    },
  };
};

// Create or change one employee's share on one project, keeping their total within 100%.
const assign = async ({ employeeId, projectId, allocation }, userId) => {
  const [employee, project] = await Promise.all([Employee.findById(employeeId), Project.findById(projectId)]);
  if (!employee) throw new AppError(404, "Employee not found");
  if (employee.status === "Inactive") throw new AppError(400, "Cannot assign an inactive employee");
  if (!project) throw new AppError(404, "Project not found");
  if (["Completed", "Cancelled"].includes(project.status)) {
    throw new AppError(400, `Cannot assign people to a ${project.status.toLowerCase()} project`);
  }

  const others = await Assignment.find({ employee: employeeId, project: { $ne: projectId } });
  const elsewhere = others.reduce((sum, assignment) => sum + assignment.allocation, 0);
  if (elsewhere + allocation > 100) {
    throw new AppError(400, `${employee.name} is already ${elsewhere}% allocated to other projects, so at most ${100 - elsewhere}% is left`);
  }

  return Assignment.findOneAndUpdate(
    { employee: employeeId, project: projectId },
    { $set: { allocation }, $setOnInsert: { createdBy: userId } },
    { upsert: true, returnDocument: "after", runValidators: true }
  );
};

const unassign = async (id) => {
  const assignment = await Assignment.findByIdAndDelete(id);
  if (!assignment) throw new AppError(404, "Assignment not found");
};

module.exports = { list, assign, unassign };
