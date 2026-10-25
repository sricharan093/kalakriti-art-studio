import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../app.js';
import { User } from '../models/User.js';
import { Painting } from '../models/Painting.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

describe('Image Upload & Admin Security Tests', () => {
  let adminCookie;
  let customerCookie;

  // Buffer for a valid 1x1 PNG image
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  // Buffer for a dummy text file
  const textBuffer = Buffer.from('This is a plain text file, not an image.');

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
    await User.create({
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

  it('rejects unauthenticated requests to image upload endpoint with 401', async () => {
    const res = await request(app)
      .post('/api/paintings/upload-image')
      .attach('image', validPngBuffer, 'test.png');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects customer accounts from upload endpoint with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/paintings/upload-image')
      .set('Cookie', customerCookie)
      .attach('image', validPngBuffer, 'test.png');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/ADMIN role required/i);
  });

  it('allows authenticated administrator to upload a valid image file', async () => {
    const res = await request(app)
      .post('/api/paintings/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', validPngBuffer, 'peacock-canvas.png');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.imageUrl).toMatch(/^uploads\/paintings\/painting-.*\.png$/);
    expect(res.body.filename).toBeDefined();

    // Verify file actually exists in UPLOAD_DIR
    const filePath = path.join(UPLOAD_DIR, res.body.filename);
    expect(fs.existsSync(filePath)).toBe(true);

    // Verify uploaded image is served via static route
    const staticRes = await request(app).get(`/${res.body.imageUrl}`);
    expect(staticRes.status).toBe(200);
    expect(staticRes.headers['content-type']).toMatch(/image\/png/);

    // Clean up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  it('rejects invalid file formats (e.g. .txt, .pdf) with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/paintings/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', textBuffer, 'malicious.txt');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Unsupported file type|Only JPG/i);
  });

  it('rejects oversized files exceeding 5MB with 400 Bad Request', async () => {
    // Create an artificial oversized buffer (> 5MB)
    const oversizedBuffer = Buffer.alloc(5.2 * 1024 * 1024);

    const res = await request(app)
      .post('/api/paintings/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', oversizedBuffer, 'oversized.png');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/5 MB|limit/i);
  });

  it('allows admin to create a painting directly with multipart image upload', async () => {
    const res = await request(app)
      .post('/api/paintings')
      .set('Cookie', adminCookie)
      .field('id', 'p-test-upload-01')
      .field('title', 'Cheriyal Scroll of Valor')
      .field('artist', 'Venkatesh Nakash')
      .field('price', '15500')
      .field('category', 'Cheriyal')
      .field('dimensions', '40 x 80 cm')
      .field('medium', 'Tamarind seed paste & natural stone colours on khadi cloth')
      .field('description', 'Authentic narrative scroll painting from Telangana')
      .attach('image', validPngBuffer, 'cheriyal.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.painting.id).toBe('p-test-upload-01');
    expect(res.body.painting.imageUrl).toMatch(/^uploads\/paintings\/painting-.*\.png$/);
    expect(res.body.painting.category).toBe('Cheriyal');
    expect(res.body.painting.dimensions).toBe('40 x 80 cm');

    // Verify it appears in public catalogue
    const catalogueRes = await request(app).get('/api/paintings');
    expect(catalogueRes.status).toBe(200);
    const found = catalogueRes.body.paintings.find((p) => p.id === 'p-test-upload-01');
    expect(found).toBeDefined();
    expect(found.title).toBe('Cheriyal Scroll of Valor');

    // Clean up uploaded file
    const filename = path.basename(res.body.painting.imageUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  it('preserves backwards compatibility with seeded image paths', async () => {
    // Seeded painting format with 'images/p-001.jpg'
    const painting = await Painting.create({
      id: 'p-seed-check',
      title: 'Madhubani Heritage Seed',
      artist: 'Meera Kumari',
      description: 'Original seeded format',
      price: 6500,
      imageUrl: 'images/p-001.jpg',
      status: 'available'
    });

    const res = await request(app).get(`/api/paintings/${painting.id}`);
    expect(res.status).toBe(200);
    expect(res.body.painting.imageUrl).toBe('images/p-001.jpg');
  });
});
