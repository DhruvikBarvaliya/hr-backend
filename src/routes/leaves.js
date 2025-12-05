// src/routes/leaves.js
const express = require('express');
const wrap = require('../utils/wrap');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
const leaveCtrl = require('../controllers/leaveController');
const ApiError = require('../utils/ApiError'); // added
const Employee = require('../models/Employee'); // move require to top

const router = express.Router();

// Employee applies for leave (employee can apply for self)
router.post('/apply', auth, permit('employee', 'manager', 'hr', 'admin'), wrap(leaveCtrl.apply));

// Approve/reject by hr/manager/admin
router.post('/resolve', auth, permit('hr', 'manager', 'admin'), wrap(leaveCtrl.resolve));

// List leaves (admin/hr/manager can list; employees can list their own)
router.get('/', auth, wrap(async (req, res, next) => {
  const { user } = req;
  if (user.role === 'employee' && !req.query.employeeId) {
    if (!user.employee) throw new ApiError(403, 'Employee must be linked to user to view leaves');
    // use already-required Employee model
    const empDoc = await Employee.findById(user.employee);
    if (!empDoc) throw new ApiError(404, 'Employee profile not found');
    req.query.employeeId = empDoc.empId;
  }
  return leaveCtrl.list(req, res, next);
}));

module.exports = router;
