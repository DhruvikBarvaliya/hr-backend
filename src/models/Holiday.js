// src/models/Holiday.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const HolidaySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true, unique: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Holiday', HolidaySchema);
