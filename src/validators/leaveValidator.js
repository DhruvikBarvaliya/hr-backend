const Joi = require('joi').extend(require('@joi/date'));

const applySchema = Joi.object({
  employeeId: Joi.string().required(),
  type: Joi.string().valid('paid', 'sick', 'unpaid', 'half-day').required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  halfDay: Joi.boolean().default(false), // if true, counts as 0.5 day (startDate === endDate)
  hours: Joi.number().min(0).optional().description('Optional hours for partial-hour requests (flexible hours use)'),
  reason: Joi.string().allow('').max(1000),
});

const approveSchema = Joi.object({
  leaveId: Joi.string().required(),
  approve: Joi.boolean().required(),
});

module.exports = { applySchema, approveSchema };
