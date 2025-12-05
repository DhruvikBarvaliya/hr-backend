// src/models/Holiday.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const HolidaySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true, unique: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model("Holiday", HolidaySchema);
