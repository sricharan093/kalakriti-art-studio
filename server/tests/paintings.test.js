import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { Painting } from '../models/Painting.js';
import { Order } from '../models/Order.js';

describe('Paintings & Orders Tests', () => {
  let adminCookie;
  let customerCookie1;
  let customerCookie2;
  let customerUser1;
  let customerUser2;

  beforeEach(async () => {
    // Create Admin
    const admin = await User.create({
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
    customerUser1 = await User.create({
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
    customerUser2 = await User.create({
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

  it('allows public access to painting catalogue', async () => {
    await Painting.create({
      id: 'p-101',
      title: 'Madhubani Peacocks',
      artist: 'Sunita Devi',
      description: 'Handmade painting',
      price: 5000,
      imageUrl: 'images/p-001.jpg',
      status: 'available'
    });

    const res = await request(app).get('/api/paintings');
    expect(res.status).toBe(200);
    expect(res.body.paintings.length).toBe(1);
    expect(res.body.paintings[0].id).toBe('p-101');
  });

  it('allows admin to create painting but blocks customer with 403', async () => {
    // Block customer
    const custRes = await request(app)
      .post('/api/paintings')
      .set('Cookie', customerCookie1)
      .send({
        id: 'p-102',
        title: 'Warli Art',
        artist: 'Gavit',
        price: 2500,
        imageUrl: 'images/p-002.jpg'
      });
    expect(custRes.status).toBe(403);

    // Allow admin
    const adminRes = await request(app)
      .post('/api/paintings')
      .set('Cookie', adminCookie)
      .send({
        id: 'p-102',
        title: 'Warli Art',
        artist: 'Gavit',
        price: 2500,
        imageUrl: 'images/p-002.jpg'
      });
    expect(adminRes.status).toBe(201);
    expect(adminRes.body.painting.title).toBe('Warli Art');
  });

  it('allows admin to edit available painting, but rejects editing sold painting', async () => {
    const availablePainting = await Painting.create({
      id: 'p-edit-1',
      title: 'Original Title',
      artist: 'Artist One',
      price: 3000,
      imageUrl: 'images/p-003.jpg',
      status: 'available'
    });

    const editRes = await request(app)
      .patch(`/api/paintings/${availablePainting.id}`)
      .set('Cookie', adminCookie)
      .send({ title: 'Updated Title' });
    expect(editRes.status).toBe(200);
    expect(editRes.body.painting.title).toBe('Updated Title');

    // Now set painting to sold
    availablePainting.status = 'sold';
    await availablePainting.save();

    const editSoldRes = await request(app)
      .patch(`/api/paintings/${availablePainting.id}`)
      .set('Cookie', adminCookie)
      .send({ title: 'Should Fail' });
    expect(editSoldRes.status).toBe(400);
    expect(editSoldRes.body.message).toContain('Cannot edit a sold or unavailable painting');
  });

  const validDeliveryAddress = {
    fullName: 'Rohan Verma',
    phone: '9876543210',
    streetAddress: 'Flat 402, Sunrise Residency, Sector 18',
    addressLine2: 'Near Central Park',
    city: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302020'
  };

  it('rejects painting purchase when required delivery address fields are missing', async () => {
    const painting = await Painting.create({
      id: 'p-val-1',
      title: 'Validation Art',
      artist: 'Artist',
      price: 5000,
      imageUrl: 'images/p-001.jpg',
      status: 'available'
    });

    // Completely missing deliveryAddress
    const resNoAddress = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({ paintingId: painting.id });
    expect(resNoAddress.status).toBe(400);

    // Missing phone and city
    const resMissing = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({
        paintingId: painting.id,
        deliveryAddress: {
          fullName: 'Rohan Verma',
          streetAddress: 'Street 1',
          state: 'Rajasthan',
          postalCode: '302020'
        }
      });
    expect(resMissing.status).toBe(400);
  });

  it('rejects painting purchase when phone number or PIN code is invalid', async () => {
    const painting = await Painting.create({
      id: 'p-val-2',
      title: 'Phone PIN Validation Art',
      artist: 'Artist',
      price: 5000,
      imageUrl: 'images/p-001.jpg',
      status: 'available'
    });

    // Invalid phone number
    const resBadPhone = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({
        paintingId: painting.id,
        deliveryAddress: { ...validDeliveryAddress, phone: '12345' }
      });
    expect(resBadPhone.status).toBe(400);
    expect(resBadPhone.body.message).toContain('valid 10-digit Indian mobile number');

    // Invalid PIN code (5 digits)
    const resBadPin = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({
        paintingId: painting.id,
        deliveryAddress: { ...validDeliveryAddress, postalCode: '3020' }
      });
    expect(resBadPin.status).toBe(400);
    expect(resBadPin.body.message).toContain('valid 6-digit Indian PIN code');
  });

  it('handles atomic purchase with delivery address snapshot and prevents double-purchasing same painting', async () => {
    const painting = await Painting.create({
      id: 'p-buy-1',
      title: 'Unique Art Piece',
      artist: 'Rare Artist',
      price: 15000,
      imageUrl: 'images/p-005.jpg',
      status: 'available'
    });

    // Customer 1 purchases with valid delivery address
    const buy1 = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({
        paintingId: painting.id,
        deliveryAddress: validDeliveryAddress
      });

    expect(buy1.status).toBe(201);
    expect(buy1.body.success).toBe(true);
    expect(buy1.body.order.price).toBe(15000);
    expect(buy1.body.order.deliveryAddress.fullName).toBe('Rohan Verma');
    expect(buy1.body.order.deliveryAddress.phone).toBe('9876543210');
    expect(buy1.body.order.deliveryAddress.postalCode).toBe('302020');

    // Verify painting is marked sold
    const updated = await Painting.findOne({ id: painting.id });
    expect(updated.status).toBe('sold');

    // Customer 2 attempts to purchase same painting
    const buy2 = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie2)
      .send({
        paintingId: painting.id,
        deliveryAddress: validDeliveryAddress
      });

    expect(buy2.status).toBe(409);
    expect(buy2.body.message).toContain('This painting has just been sold');
  });

  it('protects against concurrent simultaneous purchases with atomic updates', async () => {
    const painting = await Painting.create({
      id: 'p-race-1',
      title: 'High Demand Painting',
      artist: 'Master Artist',
      price: 50000,
      imageUrl: 'images/p-006.jpg',
      status: 'available'
    });

    // Fire two purchase requests concurrently with delivery addresses
    const [res1, res2] = await Promise.all([
      request(app).post('/api/orders').set('Cookie', customerCookie1).send({ paintingId: painting.id, deliveryAddress: validDeliveryAddress }),
      request(app).post('/api/orders').set('Cookie', customerCookie2).send({ paintingId: painting.id, deliveryAddress: validDeliveryAddress })
    ]);

    const statuses = [res1.status, res2.status].sort();
    // Exactly one must succeed (201) and the other must be rejected (409)
    expect(statuses).toEqual([201, 409]);

    const orderCount = await Order.countDocuments({ paintingId: painting.id });
    expect(orderCount).toBe(1);
  });

  it('allows customer to view saved delivery address in order history', async () => {
    const painting = await Painting.create({
      id: 'p-hist-1',
      title: 'History Art Piece',
      artist: 'Historian Artist',
      price: 18000,
      imageUrl: 'images/p-001.jpg',
      status: 'available'
    });

    await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({ paintingId: painting.id, deliveryAddress: validDeliveryAddress });

    const myOrdersRes = await request(app)
      .get('/api/orders/my')
      .set('Cookie', customerCookie1);

    expect(myOrdersRes.status).toBe(200);
    expect(myOrdersRes.body.orders.length).toBeGreaterThan(0);
    const orderWithAddress = myOrdersRes.body.orders.find(o => o.deliveryAddress?.fullName === 'Rohan Verma');
    expect(orderWithAddress).toBeDefined();
    expect(orderWithAddress.deliveryAddress.city).toBe('Jaipur');
    expect(orderWithAddress.deliveryAddress.postalCode).toBe('302020');
  });

  it('allows admin to view all orders with delivery address and blocks customer', async () => {
    const painting = await Painting.create({
      id: 'p-admin-inspect-1',
      title: 'Admin Inspect Art',
      artist: 'Heritage Artist',
      price: 22000,
      imageUrl: 'images/p-002.jpg',
      status: 'available'
    });

    await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({ paintingId: painting.id, deliveryAddress: validDeliveryAddress });

    // Admin access
    const adminOrdersRes = await request(app)
      .get('/api/admin/orders')
      .set('Cookie', adminCookie);

    expect(adminOrdersRes.status).toBe(200);
    expect(adminOrdersRes.body.orders.length).toBeGreaterThan(0);
    const found = adminOrdersRes.body.orders.find(o => o.paintingId === painting.id);
    expect(found).toBeDefined();
    expect(found.deliveryAddress?.fullName).toBe('Rohan Verma');
    expect(found.deliveryAddress?.phone).toBe('9876543210');

    // Customer access blocked
    const customerAdminRes = await request(app)
      .get('/api/admin/orders')
      .set('Cookie', customerCookie1);

    expect(customerAdminRes.status).toBe(403);
  });

  it('allows customer to cancel own placed order and restores painting availability', async () => {
    const painting = await Painting.create({
      id: 'p-cancel-1',
      title: 'Cancellable Art',
      artist: 'Artist',
      price: 4000,
      imageUrl: 'images/p-007.jpg',
      status: 'available'
    });

    const buyRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({ paintingId: painting.id, deliveryAddress: validDeliveryAddress });

    const orderId = buyRes.body.order._id;

    // Customer 1 cancels
    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/cancel`)
      .set('Cookie', customerCookie1);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.status).toBe('cancelled');

    // Verify painting availability is restored
    const restoredPainting = await Painting.findOne({ id: painting.id });
    expect(restoredPainting.status).toBe('available');

    // Attempting to cancel already cancelled order fails with 400
    const doubleCancel = await request(app)
      .patch(`/api/orders/${orderId}/cancel`)
      .set('Cookie', customerCookie1);
    expect(doubleCancel.status).toBe(400);
  });

  it('enforces ownership: customer 2 cannot access or cancel customer 1 order (returns 404)', async () => {
    const painting = await Painting.create({
      id: 'p-private-1',
      title: 'Private Art',
      artist: 'Artist',
      price: 6000,
      imageUrl: 'images/p-008.jpg',
      status: 'available'
    });

    const buyRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie1)
      .send({ paintingId: painting.id, deliveryAddress: validDeliveryAddress });

    const orderId = buyRes.body.order._id;

    // Customer 2 attempts to cancel Customer 1's order
    const breachRes = await request(app)
      .patch(`/api/orders/${orderId}/cancel`)
      .set('Cookie', customerCookie2);

    expect(breachRes.status).toBe(404);
  });
});
