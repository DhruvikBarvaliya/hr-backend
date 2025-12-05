const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
  const payload = req.body;
  // simple: ensure empId provided
  if (!payload.empId || !payload.name) return res.status(400).json({ error: 'empId and name required' });
  const exists = await Employee.findOne({ empId: payload.empId });
  if (exists) return res.status(400).json({ error: 'Employee with empId exists' });
  const emp = await Employee.create(payload);
  return res.status(201).json(emp);
};

exports.getEmployees = async (req, res) => {
  const list = await Employee.find().limit(100);
  return res.json(list);
};
