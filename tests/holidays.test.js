// basic skeleton; adapt to your auth flow
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Holiday = require('../src/models/Holiday');

describe('Holidays API (basic)', () => {
  let adminToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await Holiday.deleteMany({});
    // create admin via register
    const reg = await request(app).post('/api/v1/auth/register').send({ name: 'Admin', email: 'admin@t.com', password: 'P@ssw0rd', role: 'admin' });
    adminToken = reg.body.token;
  });

  afterAll(async () => {
    await Holiday.deleteMany({});
    await mongoose.connection.close();
  });

  test('create & list holiday', async () => {
    const res = await request(app).post('/api/v1/holidays').set('Authorization', `Bearer ${adminToken}`).send({ name: 'TestDay', date: '2026-01-01' });
    expect(res.statusCode).toBe(201);
    const list = await request(app).get('/api/v1/holidays').set('Authorization', `Bearer ${adminToken}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
  });
});
