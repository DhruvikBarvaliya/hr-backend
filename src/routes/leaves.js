const express = require('express');
const wrap = require('../utils/wrap');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
const leaveCtrl = require('../controllers/leaveController');

const router = express.Router();

// Employee applies for leave (employee can apply for self)
router.post('/apply', auth, permit('employee', 'manager', 'hr', 'admin'), wrap(leaveCtrl.apply));

// Approve/reject by hr/manager/admin
router.post('/resolve', auth, permit('hr', 'manager', 'admin'), wrap(leaveCtrl.resolve));

// List leaves (admin/hr/manager can list; employees can list their own)
router.get('/', auth, wrap(async (req, res, next) => {
  const { user } = req;
  // if employee and no employeeId query, force employeeId
  if (user.role === 'employee' && !req.query.employeeId) {
    // ensure user has employee linked
    if (!user.employee) throw new ApiError(403, 'Employee must be linked to user to view leaves');
    req.query.employeeId = (await require('../models/Employee').findById(user.employee)).empId;
  }
  return leaveCtrl.list(req, res, next);
}));

module.exports = router;
