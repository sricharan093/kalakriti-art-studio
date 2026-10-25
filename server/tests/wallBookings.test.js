import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { WallBooking } from '../models/WallBooking.js';
import { StudioMeta } from '../models/StudioMeta.js';

// Helper to format date YYYY-MM-DD
const formatDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

describe('Wall Bookings Tests', () => {
  let adminCookie;
  let customerCookie1;
  let customerCookie2;
  let customer1;
  let customer2;

  beforeEach(async () => {
    // Seed studio meta mural rate
    await StudioMeta.create({
      key: 'studio_config',
      currency: 'INR',
      muralRatePerSqFt: 150
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

  it('rejects booking dates less than 7 days or more than 90 days away', async () => {
    // 3 days ahead -> too soon
    const resSoon = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: formatDate(3),
        wallSize: 50,
        address: '123 Art Lane, Bangalore'
      });
    expect(resSoon.status).toBe(400);
    expect(resSoon.body.message).toContain('at least 7 days');

    // 100 days ahead -> too far
    const resFar = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: formatDate(100),
        wallSize: 50,
        address: '123 Art Lane, Bangalore'
      });
    expect(resFar.status).toBe(400);
    expect(resFar.body.message).toContain('cannot be more than 90 days');
  });

  it('validates wall size boundaries (10 to 500 sq ft)', async () => {
    const validDate = formatDate(15);

    const resTooSmall = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: validDate,
        wallSize: 5,
        address: '123 Art Lane'
      });
    expect(resTooSmall.status).toBe(400);

    const resTooLarge = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: validDate,
        wallSize: 600,
        address: '123 Art Lane'
      });
    expect(resTooLarge.status).toBe(400);
  });

  it('calculates total price authoritatively (wallSize * 150) and sets status to requested', async () => {
    const validDate = formatDate(20);
    const wallSize = 100;

    const res = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: validDate,
        wallSize,
        address: '456 Studio Road, Jaipur'
      });

    expect(res.status).toBe(201);
    expect(res.body.booking.appliedRate).toBe(150);
    expect(res.body.booking.totalPrice).toBe(15000); // 100 * 150
    expect(res.body.booking.status).toBe('requested');
  });

  it('enforces one booking per date and rejects duplicate bookings', async () => {
    const targetDate = formatDate(25);

    // Customer 1 books
    const res1 = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: targetDate,
        wallSize: 40,
        address: 'First Address'
      });
    expect(res1.status).toBe(201);

    // Customer 2 attempts to book the same date
    const res2 = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie2)
      .send({
        bookingDate: targetDate,
        wallSize: 60,
        address: 'Second Address'
      });
    expect(res2.status).toBe(409);
    expect(res2.body.message).toContain('already reserved');
  });

  it('allows admin to confirm or decline requested booking, blocks customer from admin action', async () => {
    const targetDate = formatDate(30);
    const bookRes = await request(app)
      .post('/api/wall-bookings')
      .set('Cookie', customerCookie1)
      .send({
        bookingDate: targetDate,
        wallSize: 80,
        address: '789 Heritage Street'
      });
    const bookingId = bookRes.body.booking._id;

    // Customer attempting admin confirm -> 403
    const custAttempt = await request(app)
      .patch(`/api/admin/wall-bookings/${bookingId}/confirm`)
      .set('Cookie', customerCookie1);
    expect(custAttempt.status).toBe(403);

    // Admin confirms -> 200
    const adminConfirm = await request(app)
      .patch(`/api/admin/wall-bookings/${bookingId}/confirm`)
      .set('Cookie', adminCookie);
    expect(adminConfirm.status).toBe(200);
    expect(adminConfirm.body.booking.status).toBe('confirmed');
  });

  it('enforces 3-day cancellation cutoff rule and checks ownership', async () => {
    // 10 days away -> eligible for cancellation
    const bookingEligible = await WallBooking.create({
      customer: customer1._id,
      bookingDate: formatDate(10),
      address: 'Eligible address',
      wallSize: 50,
      appliedRate: 150,
      totalPrice: 7500,
      status: 'requested'
    });

    // Customer 2 attempting to cancel Customer 1's booking -> 404
    const breachRes = await request(app)
      .patch(`/api/wall-bookings/${bookingEligible._id}/cancel`)
      .set('Cookie', customerCookie2);
    expect(breachRes.status).toBe(404);

    // Customer 1 cancels eligible booking -> 200
    const cancelRes = await request(app)
      .patch(`/api/wall-bookings/${bookingEligible._id}/cancel`)
      .set('Cookie', customerCookie1);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.booking.status).toBe('cancelled');

    // 2 days away -> within cutoff, cancellation forbidden
    const bookingCutoff = await WallBooking.create({
      customer: customer1._id,
      bookingDate: formatDate(2),
      address: 'Too close address',
      wallSize: 50,
      appliedRate: 150,
      totalPrice: 7500,
      status: 'requested'
    });

    const cutoffRes = await request(app)
      .patch(`/api/wall-bookings/${bookingCutoff._id}/cancel`)
      .set('Cookie', customerCookie1);
    expect(cutoffRes.status).toBe(400);
    expect(cutoffRes.body.message).toContain('at least 3 days before');
  });
});
