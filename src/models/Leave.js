const mongoose = require('mongoose');

const { Schema } = mongoose;

const LeaveSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: {
      type: String,
      enum: ['paid', 'sick', 'unpaid', 'half-day'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    halfDay: { type: Boolean, default: false },
    hours: { type: Number, default: 0 }, // if partial hours used
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reason: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Leave', LeaveSchema);
