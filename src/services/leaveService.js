const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const logger = require("../utils/logger");
const config = require("../config");
const { countBusinessDays } = require("../utils/businessDays");
/**
 * computeLeaveDays: now business-day-aware and async
 * - halfDay => 0.5 (enforced)
 * - otherwise returns number of business days between start and end inclusive
 */
async function computeLeaveDays(startDate, endDate, halfDay = false) {
  if (halfDay) return 0.5;
  const days = await countBusinessDays(startDate, endDate);
  return days;
}

/**
 * Apply for leave — creates a leave in pending state after validations.
 */
exports.applyLeave = async (
  {
    employeeId,
    type,
    startDate,
    endDate,
    halfDay = false,
    hours = 0,
    reason = "",
  },
  appliedBy
) => {
  // Validate employee exists
  const employee = await Employee.findOne({ empId: employeeId });
  if (!employee) throw new ApiError(404, "Employee not found");

  // compute days/hours
  const days = computeLeaveDays(startDate, endDate, halfDay);
  // For paid/sick: must have sufficient leaveBalance when approving. We allow creation, but optionally can pre-check.
  if ((type === "paid" || type === "sick") && days <= 0) {
    throw new ApiError(400, "Invalid leave duration");
  }

  // If requesting to use flexible hours (hours > 0), ensure hours <= flexibleHoursAccrued at apply time (optional)
  if (hours > 0 && hours > employee.flexibleHoursAccrued) {
    throw new ApiError(400, "Insufficient flexible hours available");
  }

  const leave = await Leave.create({
    employee: employee._id,
    type,
    startDate,
    endDate,
    halfDay,
    hours,
    reason,
    status: "pending",
  });

  logger.info("Leave applied: %s by %s", leave._id, appliedBy || "system");
  return leave;
};

/**
 * Approve or reject leave.
 * If approving: deduct balances in a transaction atomically.
 */
exports.resolveLeave = async ({ leaveId, approve, resolvedBy }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const leave = await Leave.findById(leaveId)
      .session(session)
      .populate("employee");
    if (!leave) throw new ApiError(404, "Leave not found");
    if (leave.status !== "pending")
      throw new ApiError(400, "Leave is not pending");

    if (!approve) {
      leave.status = "rejected";
      leave.resolvedBy = resolvedBy;
      await leave.save({ session });
      await session.commitTransaction();
      session.endSession();
      logger.info("Leave %s rejected by %s", leaveId, resolvedBy);
      return leave;
    }

    // approving
    const employee = await Employee.findById(leave.employee._id).session(
      session
    );
    const days = await computeLeaveDays(
      leave.startDate,
      leave.endDate,
      leave.halfDay
    );

    // For paid/sick leaves, ensure leaveBalance >= days
    if (["paid", "sick"].includes(leave.type)) {
      if (employee.leaveBalance < days) {
        throw new ApiError(400, "Insufficient leave balance to approve");
      }
      employee.leaveBalance = Number((employee.leaveBalance - days).toFixed(2));
    }

    // For flexible hours usage recorded in leave.hours
    if (leave.hours && leave.hours > 0) {
      if (employee.flexibleHoursAccrued < leave.hours) {
        throw new ApiError(400, "Insufficient flexible hours to approve");
      }
      employee.flexibleHoursAccrued = Number(
        (employee.flexibleHoursAccrued - leave.hours).toFixed(2)
      );
    }

    leave.status = "approved";
    leave.resolvedBy = resolvedBy;
    leave.approvedAt = new Date();

    await employee.save({ session });
    await leave.save({ session });

    await session.commitTransaction();
    session.endSession();
    logger.info("Leave %s approved by %s", leaveId, resolvedBy);
    return leave;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/**
 * Get leaves (filter by employeeId optional, status, date range)
 */
exports.listLeaves = async ({
  employeeId,
  status,
  fromDate,
  toDate,
  limit = 100,
}) => {
  const q = {};
  if (employeeId) {
    const emp = await Employee.findOne({ empId: employeeId });
    if (!emp) throw new ApiError(404, "Employee not found");
    q.employee = emp._id;
  }
  if (status) q.status = status;
  if (fromDate || toDate) q.startDate = {};
  if (fromDate) q.startDate.$gte = new Date(fromDate);
  if (toDate) q.startDate.$lte = new Date(toDate);

  const items = await Leave.find(q)
    .limit(Math.min(limit, 1000))
    .populate("employee");
  return items;
};

/**
 * Monthly accrual job: add monthlyAccruedLeaves to leaveBalance (apply cap)
 */
exports.accrueMonthlyForAll = async () => {
  const MAX = Number(
    process.env.MAX_CARRY_FORWARD || config.maxCarryForward || 12
  ); // default 12 days
  const employees = await Employee.find();
  const now = new Date();

  const ops = employees.map(async (emp) => {
    const addedLeaves = emp.monthlyAccruedLeaves || 1;
    emp.leaveBalance = Number((emp.leaveBalance + addedLeaves).toFixed(2));
    // cap
    if (emp.leaveBalance > MAX) emp.leaveBalance = MAX;
    // add flexible hours
    emp.flexibleHoursAccrued = Number(
      (emp.flexibleHoursAccrued + 6).toFixed(2)
    ); // 6 hours per month
    emp.accrualHistory.push({
      date: now,
      addedLeaves,
      addedFlexibleHours: 6,
      note: "Monthly accrual",
    });
    await emp.save();
    logger.info(
      "Accrued for %s: +%d leaves, +6 hours (new balance %s)",
      emp.empId,
      addedLeaves,
      emp.leaveBalance
    );
    return emp;
  });

  await Promise.all(ops);
  return { count: employees.length };
};
