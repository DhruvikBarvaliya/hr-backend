// src/validators/holidayValidator.js
const Joi = require('joi');

const createHoliday = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  date: Joi.date().iso().required(),
  description: Joi.string().allow('', null).max(1000)
});

const updateHoliday = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().allow('', null).max(1000).optional()
});

module.exports = { createHoliday, updateHoliday };
