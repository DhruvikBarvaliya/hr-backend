const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' });
}

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'User already exists' });

  const user = new User({ name, email, password, role });
  await user.save();

  const token = makeToken(user);
  return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = makeToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};
