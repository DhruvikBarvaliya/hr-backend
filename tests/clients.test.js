const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Client = require('../src/models/Client');

describe('Clients API (basic)', () => {
  let adminToken;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await Client.deleteMany({});
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin', email: 'admin2@t.com', password: 'P@ssw0rd', role: 'admin',
    });
    adminToken = reg.body.token;
  });

  afterAll(async () => {
    await Client.deleteMany({});
    await mongoose.connection.close();
  });

  test('create client and retrieve secret', async () => {
    const res = await request(app).post('/api/v1/clients').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'TestClient', username: 'testclient', password: 's3cr3t',
    });
    expect(res.statusCode).toBe(201);
    const id = res.body.data._id;
    const sec = await request(app).get(`/api/v1/clients/${id}/secret`).set('Authorization', `Bearer ${adminToken}`);
    expect(sec.statusCode).toBe(200);
    expect(sec.body.data).toHaveProperty('password');
  });
});
