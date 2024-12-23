const request = require('supertest');
const app = require('../src/app');
const { User, Order } = require('../src/models');

describe('Order Routes', () => {
  let token;

  beforeEach(async () => {
    await User.destroy({ where: {} });
    await Order.destroy({ where: {} });

    const user = await User.create({
      username: 'testuser',
      password: 'testpassword',
      role: 'manager'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });

    token = loginRes.body.token;
  });

  it('should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tableId: 1,
        waiterId: 1,
        products: [1, 2, 3]
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get all orders', async () => {
    await Order.create({ tableId: 1, waiterId: 1 });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(1);
  });
});
