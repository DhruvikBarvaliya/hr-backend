const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const encKey = process.env.ENC_KEY; // must be 32 bytes (hex/base64 decode)
if (!encKey) {
  // allow runtime safety; in production ensure ENC_KEY set.
  // eslint-disable-next-line no-console
  console.warn('ENC_KEY not set — client credentials encryption disabled (not recommended).');
}

function _key() {
  if (!encKey) return null;
  // If hex string (64 chars) use 'hex', else base64
  if (/^[0-9a-fA-F]{64}$/.test(encKey)) return Buffer.from(encKey, 'hex');
  return Buffer.from(encKey, 'base64');
}

function encrypt(text) {
  const key = _key();
  if (!key) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(enc) {
  const key = _key();
  if (!key) return enc;
  const [ivHex, tagHex, dataHex] = enc.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
