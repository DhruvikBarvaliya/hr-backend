const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr', 'manager', 'employee'], default: 'employee' },
  employee: { type: Schema.Types.ObjectId, ref: 'Employee' }, // optional link to employee profile
}, { timestamps: true });

// password hash
UserSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
