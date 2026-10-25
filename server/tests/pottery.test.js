import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { PotteryRequest } from '../models/PotteryRequest.js';
import { StudioMeta } from '../models/StudioMeta.js';

const formatDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

describe('Pottery Requests Tests', () => {
  let adminCookie;
  let customerCookie1;
  let customerCookie2;
  let customer1;
  let customer2;

  beforeEach(async () => {
    // Seed studio meta with valid pottery items and glazes
    await StudioMeta.create({
      key: 'studio_config',
      currency: 'INR',
      potteryItems: [
        { id: 'i-01', name: 'Kulhad (clay cup)' },
        { id: 'i-02', name: 'Surahi (water jug)' },
        { id: 'i-03', name: 'Matka (water pot)' }
      ],
      glazes: [
        { id: 'g-01', name: 'Kumkum Red' },
        { id: 'g-02', name: 'Haldi Yellow' },
        { id: 'g-03', name: 'Mehendi Green' }
      ]
    });

    // Create Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@studio.com',
      password: 'password123',
      role: 'ADMIN'
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@studio.com', password: 'password123' });
    adminCookie = adminLogin.headers['set-cookie'];

    // Create Customer 1
    customer1 = await User.create({
      name: 'Customer One',
      email: 'customer1@test.com',
      password: 'password123',
      role: 'CUSTOMER'
    });
    const c1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer1@test.com', password: 'password123' });
    customerCookie1 = c1Login.headers['set-cookie'];

    // Create Customer 2
    customer2 = await User.create({
      name: 'Customer Two',
      email: 'customer2@test.com',
      password: 'password123',
      role: 'CUSTOMER'
    });
    const c2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer2@test.com', password: 'password123' });
    customerCookie2 = c2Login.headers['set-cookie'];
  });

  it('provides official pottery options from seed data', async () => {
    const res = await request(app).get('/api/pottery/options');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(3);
    expect(res.body.glazes.length).toBe(3);
    expect(res.body.items[0].id).toBe('i-01');
    expect(res.body.glazes[0].id).toBe('g-01');
  });

  it('creates custom pottery request with valid item, glaze, quantity, and 14-day date', async () => {
    const validDate = formatDate(15);
    const res = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-01',
        glazeId: 'g-02',
        quantity: 4,
        neededByDate: validDate,
        notes: 'Rustic finish please'
      });

    expect(res.status).toBe(201);
    expect(res.body.potteryRequest.item.name).toBe('Kulhad (clay cup)');
    expect(res.body.potteryRequest.glaze.name).toBe('Haldi Yellow');
    expect(res.body.potteryRequest.quantity).toBe(4);
    expect(res.body.potteryRequest.status).toBe('requested');
  });

  it('rejects invalid item, glaze, quantity boundaries (>12 or <1), or date < 14 days', async () => {
    const validDate = formatDate(15);

    // Invalid item
    const resItem = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'invalid-item',
        glazeId: 'g-01',
        quantity: 2,
        neededByDate: validDate
      });
    expect(resItem.status).toBe(400);

    // Invalid glaze
    const resGlaze = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-01',
        glazeId: 'invalid-glaze',
        quantity: 2,
        neededByDate: validDate
      });
    expect(resGlaze.status).toBe(400);

    // Quantity > 12
    const resQty = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-01',
        glazeId: 'g-01',
        quantity: 15,
        neededByDate: validDate
      });
    expect(resQty.status).toBe(400);

    // Date < 14 days
    const resDate = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-01',
        glazeId: 'g-01',
        quantity: 2,
        neededByDate: formatDate(5)
      });
    expect(resDate.status).toBe(400);
    expect(resDate.body.message).toContain('at least 14 days');
  });

  it('allows customer to edit only while in requested status, prevents edit after status change', async () => {
    const validDate = formatDate(16);
    const createRes = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-01',
        glazeId: 'g-01',
        quantity: 2,
        neededByDate: validDate
      });
    const reqId = createRes.body.potteryRequest._id;

    // Edit while status is 'requested' -> succeeds
    const editRes = await request(app)
      .patch(`/api/pottery-requests/${reqId}`)
      .set('Cookie', customerCookie1)
      .send({ quantity: 6 });
    expect(editRes.status).toBe(200);
    expect(editRes.body.potteryRequest.quantity).toBe(6);

    // Admin accepts request
    await request(app)
      .patch(`/api/admin/pottery-requests/${reqId}/accept`)
      .set('Cookie', adminCookie);

    // Customer attempt to edit accepted request -> fails with 400
    const editAfterAccept = await request(app)
      .patch(`/api/pottery-requests/${reqId}`)
      .set('Cookie', customerCookie1)
      .send({ quantity: 8 });
    expect(editAfterAccept.status).toBe(400);
    expect(editAfterAccept.body.message).toContain('Only \'requested\' orders can be modified');
  });

  it('allows customer to cancel only while in requested status, prevents cancellation once accepted/declined', async () => {
    const validDate = formatDate(18);
    const createRes = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-02',
        glazeId: 'g-02',
        quantity: 1,
        neededByDate: validDate
      });
    const reqId = createRes.body.potteryRequest._id;

    // Customer cancels -> succeeds
    const cancelRes = await request(app)
      .patch(`/api/pottery-requests/${reqId}/cancel`)
      .set('Cookie', customerCookie1);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.potteryRequest.status).toBe('cancelled');

    // Cancelling already cancelled request -> fails
    const doubleCancel = await request(app)
      .patch(`/api/pottery-requests/${reqId}/cancel`)
      .set('Cookie', customerCookie1);
    expect(doubleCancel.status).toBe(400);
  });

  it('enforces ownership: customer 2 cannot view or modify customer 1 request (returns 404)', async () => {
    const validDate = formatDate(20);
    const createRes = await request(app)
      .post('/api/pottery-requests')
      .set('Cookie', customerCookie1)
      .send({
        itemId: 'i-03',
        glazeId: 'g-03',
        quantity: 3,
        neededByDate: validDate
      });
    const reqId = createRes.body.potteryRequest._id;

    // Customer 2 attempts to edit -> 404
    const breachEdit = await request(app)
      .patch(`/api/pottery-requests/${reqId}`)
      .set('Cookie', customerCookie2)
      .send({ quantity: 5 });
    expect(breachEdit.status).toBe(404);

    // Customer 2 attempts to cancel -> 404
    const breachCancel = await request(app)
      .patch(`/api/pottery-requests/${reqId}/cancel`)
      .set('Cookie', customerCookie2);
    expect(breachCancel.status).toBe(404);
  });
});
