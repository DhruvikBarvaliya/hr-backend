// src/models/Client.js
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const { Schema } = mongoose;

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true },
    passwordEncrypted: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' }, // who created this client
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

ClientSchema.methods.setPassword = function setPassword(raw) {
  this.passwordEncrypted = encrypt(raw);
};

ClientSchema.methods.getPassword = function getPassword() {
  return decrypt(this.passwordEncrypted);
};

ClientSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.passwordEncrypted;
  return obj;
};

module.exports = mongoose.model('Client', ClientSchema);
