const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
        role: 'waiter'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Usuário registrado com sucesso');
  });

  it('should login a user', async () => {
    await User.create({
      username: 'testuser',
      password: 'testpassword',
      role: 'waiter'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });
});
