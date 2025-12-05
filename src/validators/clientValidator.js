// src/validators/clientValidator.js
const Joi = require('joi');

const createClient = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  username: Joi.string().trim().min(1).max(200).required(),
  password: Joi.string().min(6).max(200).required(),
  metadata: Joi.object().optional()
});

const updateClient = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  username: Joi.string().trim().min(1).max(200).optional(),
  password: Joi.string().min(6).max(200).optional(),
  metadata: Joi.object().optional()
});

module.exports = { createClient, updateClient };
