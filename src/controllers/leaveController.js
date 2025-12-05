const ApiError = require('../utils/ApiError');
const LeaveService = require('../services/leaveService');
const { applySchema, approveSchema } = require('../validators/leaveValidator');

/**
 * Apply leave
 */
exports.apply = async (req, res) => {
  const data = await applySchema.validateAsync(req.body, { abortEarly: false });
  // appliedBy from req.user.email or system
  const appliedBy = req.user ? req.user.email : 'system';
  const leave = await LeaveService.applyLeave(data, appliedBy);
  return res.status(201).json({ data: leave });
};

/**
 * Approve/Reject
 */
exports.resolve = async (req, res) => {
  const data = await approveSchema.validateAsync(req.body, { abortEarly: false });
  // only HR/admin/manager should reach this route via permission middleware
  const resolvedBy = req.user ? req.user.email : 'system';
  const result = await LeaveService.resolveLeave({ leaveId: data.leaveId, approve: data.approve, resolvedBy });
  return res.json({ data: result });
};

/**
 * List leaves (query params supported)
 */
exports.list = async (req, res) => {
  const {
    employeeId, status, fromDate, toDate, limit,
  } = req.query;
  const items = await LeaveService.listLeaves({
    employeeId, status, fromDate, toDate, limit: Number(limit) || 100,
  });
  return res.json({ data: items });
};
