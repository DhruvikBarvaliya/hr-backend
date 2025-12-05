// src/controllers/clientController.js
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Create client (admin/hr only)
 */
exports.createClient = async (req, res) => {
  const {
    name, username, password, metadata,
  } = req.body;

  // optional uniqueness check by name or username
  const exists = await Client.findOne({ $or: [{ name }, { username }] });
  if (exists) throw new ApiError(400, 'Client with same name or username already exists');

  const client = new Client({
    name, username, owner: req.user?._id, metadata,
  });
  client.setPassword(password);
  await client.save();

  logger.info('Client created %s by %s', client._id, req.user?.email || 'system');
  return res.status(201).json({ data: client.toSafeObject() });
};

/**
 * Update client (admin/hr)
 */
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const client = await Client.findById(id);
  if (!client) throw new ApiError(404, 'Client not found');

  if (payload.name) client.name = payload.name;
  if (payload.username) client.username = payload.username;
  if (payload.password) client.setPassword(payload.password);
  if (payload.metadata !== undefined) client.metadata = payload.metadata;

  await client.save();
  logger.info('Client updated %s by %s', id, req.user?.email || 'system');
  return res.json({ data: client.toSafeObject() });
};

/**
 * Delete client
 */
exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  const client = await Client.findById(id);
  if (!client) throw new ApiError(404, 'Client not found');
  await client.remove();
  logger.info('Client deleted %s by %s', id, req.user?.email || 'system');
  return res.json({ ok: true });
};

/**
 * List clients with optional search
 */
exports.listClients = async (req, res) => {
  const { q, limit = 100, page = 1 } = req.query;
  const filter = {};
  if (q) {
    const re = new RegExp(String(q), 'i');
    filter.$or = [{ name: re }, { username: re }];
  }

  const items = await Client.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  // return safe object (no passwords)
  const safe = items.map((c) => c.toSafeObject());
  return res.json({ data: safe });
};

/**
 * Get client secret (admin only)
 * Returns decrypted password — keep route restricted and audited.
 */
exports.getClientSecret = async (req, res) => {
  const { id } = req.params;
  const client = await Client.findById(id);
  if (!client) throw new ApiError(404, 'Client not found');

  const secret = client.getPassword();
  return res.json({ data: { id: client._id, username: client.username, password: secret } });
};
