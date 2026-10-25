import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../app.js';
import { User } from '../models/User.js';
import { Painting } from '../models/Painting.js';
import { Order } from '../models/Order.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

describe('Administrator Painting Management & Safe Deletion Tests', () => {
  let adminCookie;
  let customerCookie;
  let customerUser;

  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  beforeEach(async () => {
    // Create Admin user
    await User.create({
      name: 'Studio Administrator',
      email: 'studio-admin@artstudio.in',
      password: 'password123',
      role: 'ADMIN'
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'studio-admin@artstudio.in', password: 'password123' });
    adminCookie = adminLogin.headers['set-cookie'];

    // Create Customer user
    customerUser = await User.create({
      name: 'Art Collector',
      email: 'collector@customer.in',
      password: 'password123',
      role: 'CUSTOMER'
    });

    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'collector@customer.in', password: 'password123' });
    customerCookie = customerLogin.headers['set-cookie'];
  });

  it('rejects unauthorized customers from deleting paintings with 403 Forbidden', async () => {
    const painting = await Painting.create({
      id: 'p-auth-test',
      title: 'Protected Heritage Art',
      artist: 'Rameshwar',
      price: 5000,
      imageUrl: 'images/p-001.jpg',
      status: 'available'
    });

    const res = await request(app)
      .delete(`/api/paintings/${painting.id}`)
      .set('Cookie', customerCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('permanently deletes a painting that has NO customer orders and cleans up image', async () => {
    // 1. Upload an image
    const uploadRes = await request(app)
      .post('/api/paintings/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', validPngBuffer, 'temp-canvas.png');
    expect(uploadRes.status).toBe(200);

    const filename = uploadRes.body.filename;
    const filePath = path.join(UPLOAD_DIR, filename);
    expect(fs.existsSync(filePath)).toBe(true);

    // 2. Create painting
    const painting = await Painting.create({
      id: 'p-no-orders',
      title: 'Ephemeral Horizon',
      artist: 'Kavita Sen',
      price: 18000,
      imageUrl: uploadRes.body.imageUrl,
      status: 'available'
    });

    // 3. Delete painting as admin
    const deleteRes = await request(app)
      .delete(`/api/paintings/${painting.id}`)
      .set('Cookie', adminCookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.action).toBe('deleted');

    // 4. Verify painting record is gone
    const checkDb = await Painting.findOne({ id: 'p-no-orders' });
    expect(checkDb).toBeNull();

    // 5. Verify image file was removed
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('safely archives a painting that HAS existing customer orders to preserve order history', async () => {
    // 1. Create painting
    const painting = await Painting.create({
      id: 'p-with-orders',
      title: 'Timeless Pichwai of Shrinathji',
      artist: 'Shyam Sundar',
      price: 25000,
      imageUrl: 'images/p-002.jpg',
      status: 'available'
    });

    // 2. Customer places an order for this painting
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        paintingId: painting.id,
        deliveryAddress: {
          fullName: 'Art Collector',
          phone: '+91 9876543210',
          streetAddress: 'Flat 402, Lotus Towers',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001'
        }
      });
    expect(orderRes.status).toBe(201);

    // Verify order exists in DB
    const orderCount = await Order.countDocuments({ paintingId: painting.id });
    expect(orderCount).toBe(1);

    // 3. Admin deletes the painting
    const deleteRes = await request(app)
      .delete(`/api/paintings/${painting.id}`)
      .set('Cookie', adminCookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.action).toBe('archived');
    expect(deleteRes.body.message).toMatch(/safely archived to protect order records/i);

    // 4. Verify painting is archived in DB rather than deleted
    const updatedPainting = await Painting.findOne({ id: painting.id });
    expect(updatedPainting).toBeDefined();
    expect(updatedPainting.status).toBe('archived');
    expect(updatedPainting.isArchived).toBe(true);

    // 5. Verify customer order remains intact and populated
    const ordersAfter = await Order.find({ paintingId: painting.id }).populate('painting');
    expect(ordersAfter.length).toBe(1);
    expect(ordersAfter[0].painting.title).toBe('Timeless Pichwai of Shrinathji');
  });

  it('excludes archived paintings from customer catalogue and search', async () => {
    // Create an active painting and an archived painting
    await Painting.create({
      id: 'p-active-01',
      title: 'Active Madhubani Birds',
      artist: 'Sunita Devi',
      price: 9000,
      imageUrl: 'images/p-003.jpg',
      status: 'available',
      isArchived: false
    });

    await Painting.create({
      id: 'p-archived-01',
      title: 'Archived Madhubani Fish',
      artist: 'Sunita Devi',
      price: 9500,
      imageUrl: 'images/p-004.jpg',
      status: 'archived',
      isArchived: true
    });

    // Public / customer request
    const publicRes = await request(app).get('/api/paintings');
    expect(publicRes.status).toBe(200);

    const ids = publicRes.body.paintings.map((p) => p.id);
    expect(ids).toContain('p-active-01');
    expect(ids).not.toContain('p-archived-01');

    // Admin request with includeArchived=true
    const adminRes = await request(app)
      .get('/api/paintings?includeArchived=true')
      .set('Cookie', adminCookie);
    expect(adminRes.status).toBe(200);

    const adminIds = adminRes.body.paintings.map((p) => p.id);
    expect(adminIds).toContain('p-active-01');
    expect(adminIds).toContain('p-archived-01');
  });

  it('rejects purchase attempts for archived paintings', async () => {
    const archivedPainting = await Painting.create({
      id: 'p-cannot-buy',
      title: 'Archived Masterpiece',
      artist: 'Anand Mohan',
      price: 12000,
      imageUrl: 'images/p-005.jpg',
      status: 'archived',
      isArchived: true
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        paintingId: archivedPainting.id,
        deliveryAddress: {
          fullName: 'Art Collector',
          phone: '+91 9876543210',
          streetAddress: '100 Heritage Marg',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/archived and is no longer available for purchase/i);
  });

  it('allows administrator to restore an archived painting back to available status', async () => {
    const painting = await Painting.create({
      id: 'p-restore-me',
      title: 'Restorable Tanjore Gold',
      artist: 'Kalyani',
      price: 32000,
      imageUrl: 'images/p-006.jpg',
      status: 'archived',
      isArchived: true
    });

    const restoreRes = await request(app)
      .patch(`/api/paintings/${painting.id}/restore`)
      .set('Cookie', adminCookie);

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.success).toBe(true);
    expect(restoreRes.body.painting.status).toBe('available');
    expect(restoreRes.body.painting.isArchived).toBe(false);

    // Verify it is now visible to customers again
    const publicRes = await request(app).get('/api/paintings');
    const ids = publicRes.body.paintings.map((p) => p.id);
    expect(ids).toContain('p-restore-me');
  });
});
