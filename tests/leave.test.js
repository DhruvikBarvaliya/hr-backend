const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Leave = require('../src/models/Leave');

describe('Leave flows', () => {
  let adminToken;
  let empToken;
  let emp;

  beforeAll(async () => {
    // ensure test DB connected (assumes MONGO_URI points to test db)
    await mongoose.connect(process.env.MONGO_URI, {});

    // create admin user
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Leave.deleteMany({});

    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'P@ssw0rd',
      role: 'admin'
    });
    adminToken = adminRes.body.token;

    // create employee user + employee profile
    const empProfile = await Employee.create({ empId: 'T100', name: 'Test Emp', email: 'te@test.com', monthlyAccruedLeaves: 1, leaveBalance: 2, flexibleHoursAccrued: 6 });
    emp = empProfile;
    const empUser = await request(app).post('/api/v1/auth/register').send({
      name: 'EmpUser',
      email: 'emp@test.com',
      password: 'P@ssw0rd',
      role: 'employee'
    });
    // link employee to user
    await User.updateOne({ email: 'emp@test.com' }, { employee: emp._id });
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'emp@test.com', password: 'P@ssw0rd' });
    empToken = login.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('employee can apply for a half-day leave', async () => {
    const res = await request(app).post('/api/v1/leaves/apply')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        employeeId: 'T100',
        type: 'paid',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        halfDay: true,
        reason: 'doctor'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('status', 'pending');
  });

  test('admin can approve the leave', async () => {
    const pending = await Leave.findOne({}).exec();
    const res = await request(app).post('/api/v1/leaves/resolve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ leaveId: pending._id.toString(), approve: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('status', 'approved');

    // verify employee leaveBalance decreased by 0.5
    const updated = await Employee.findById(emp._id);
    expect(updated.leaveBalance).toBeCloseTo(1.5, 3);
  });
});
