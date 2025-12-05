// src/controllers/holidayController.js
const Holiday = require('../models/Holiday');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Create holiday (admin/hr)
 */
exports.createHoliday = async (req, res) => {
  const { name, date, description } = req.body;
  // ensure uniqueness by date
  const y = new Date(date);
  const start = new Date(Date.UTC(y.getUTCFullYear(), y.getUTCMonth(), y.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  const exists = await Holiday.findOne({ date: { $gte: start, $lte: end } });
  if (exists) throw new ApiError(400, 'Holiday already exists for this date');

  const holiday = await Holiday.create({ name, date: start, description });
  logger.info('Holiday created: %s by %s', holiday._id, req.user?.email || 'system');
  return res.status(201).json({ data: holiday });
};

/**
 * Update holiday
 */
exports.updateHoliday = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const holiday = await Holiday.findById(id);
  if (!holiday) throw new ApiError(404, 'Holiday not found');

  // if updating date, ensure no other holiday exists on that date
  if (payload.date) {
    const y = new Date(payload.date);
    const start = new Date(Date.UTC(y.getUTCFullYear(), y.getUTCMonth(), y.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    const conflict = await Holiday.findOne({ _id: { $ne: id }, date: { $gte: start, $lte: end } });
    if (conflict) throw new ApiError(400, 'Another holiday already exists for this date');
    holiday.date = start;
  }

  if (payload.name) holiday.name = payload.name;
  if (payload.description !== undefined) holiday.description = payload.description;

  await holiday.save();
  logger.info('Holiday updated: %s by %s', holiday._id, req.user?.email || 'system');
  return res.json({ data: holiday });
};

/**
 * Delete holiday
 */
exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;
  const holiday = await Holiday.findById(id);
  if (!holiday) throw new ApiError(404, 'Holiday not found');
  await holiday.remove();
  logger.info('Holiday deleted: %s by %s', id, req.user?.email || 'system');
  return res.json({ ok: true });
};

/**
 * List holidays (filter by year/month optional)
 */
exports.listHolidays = async (req, res) => {
  const { year, month, limit = 200, page = 1 } = req.query;
  const q = {};
  if (year) {
    const y = Number(year);
    const start = new Date(Date.UTC(y, 0, 1));
    const end = new Date(Date.UTC(y + 1, 0, 1) - 1);
    q.date = { $gte: start, $lte: end };
  }
  if (month && year) {
    const y = Number(year);
    const m = Number(month) - 1;
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1) - 1);
    q.date = { $gte: start, $lte: end };
  }

  const items = await Holiday.find(q).sort({ date: 1 }).skip((page - 1) * limit).limit(Number(limit));
  return res.json({ data: items });
};
