const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long';

  jest.resetModules();
  const connectDB = require('../../src/config/database');
  await connectDB();
  app = require('../../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Auth API', () => {
  const email = `user_${Date.now()}@example.com`;
  const password = 'SecurePass1';

  test('registers a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email, password });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
  });

  test('logs in and returns user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects invalid login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });
});

describe('Debts API (authenticated)', () => {
  let cookies;
  let profileId;
  const email = `debt_${Date.now()}@example.com`;
  const password = 'SecurePass1';

  beforeAll(async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Debt User',
      email,
      password,
    });
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    cookies = login.headers['set-cookie'];
    const profiles = await request(app).get('/api/v1/profiles').set('Cookie', cookies);
    profileId = profiles.body.data.profiles[0]._id;
  });

  test('creates and lists a debt', async () => {
    const create = await request(app)
      .post('/api/v1/debts')
      .set('Cookie', cookies)
      .send({
        profileId,
        name: 'Home Loan',
        debtType: 'Home Loan',
        principalAmount: 5000000,
        outstandingAmount: 4200000,
        monthlyEmi: 45000,
        interestRate: 8.5,
      });

    expect(create.status).toBe(201);
    expect(create.body.data.debt.name).toBe('Home Loan');

    const list = await request(app).get('/api/v1/debts').set('Cookie', cookies);
    expect(list.status).toBe(200);
    expect(list.body.data.debts.length).toBeGreaterThan(0);

    const summary = await request(app).get('/api/v1/debts/summary').set('Cookie', cookies);
    expect(summary.status).toBe(200);
    expect(summary.body.data.summary.totalOutstanding).toBeGreaterThan(0);
  });
});
