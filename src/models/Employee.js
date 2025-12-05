const mongoose = require('mongoose');

const { Schema } = mongoose;

const AccrualHistorySchema = new Schema(
  {
    date: { type: Date, required: true },
    addedLeaves: { type: Number, default: 0 },
    addedFlexibleHours: { type: Number, default: 0 },
    note: { type: String },
  },
  { _id: false },
);

const EmployeeSchema = new Schema(
  {
    empId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    joiningDate: { type: Date, default: Date.now },
    designation: { type: String },
    department: { type: String },
    manager: { type: Schema.Types.ObjectId, ref: 'Employee' },
    // leave balance fields
    monthlyAccruedLeaves: { type: Number, default: 1 }, // accrual per month
    leaveBalance: { type: Number, default: 0 }, // in days (can be fractional, e.g., 0.5)
    flexibleHoursAccrued: { type: Number, default: 0 }, // in hours
    accrualHistory: { type: [AccrualHistorySchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Employee', EmployeeSchema);
