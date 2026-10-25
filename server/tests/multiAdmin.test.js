import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { Painting } from '../models/Painting.js';

describe('Multiple Administrator Accounts & Shared Management Tests', () => {
  let admin1Cookie;
  let admin2Cookie;
  let customerCookie;

  beforeEach(async () => {
    // 1. Initial Primary Studio Admin
    await User.create({
      name: 'Primary Studio Admin',
      email: 'admin1@artstudio.in',
      password: 'password123',
      role: 'ADMIN'
    });

    const login1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin1@artstudio.in', password: 'password123' });
    admin1Cookie = login1.headers['set-cookie'];

    // 2. Regular Customer Account
    await User.create({
      name: 'Art Collector User',
      email: 'collector@customer.in',
      password: 'password123',
      role: 'CUSTOMER'
    });

    const custLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'collector@customer.in', password: 'password123' });
    customerCookie = custLogin.headers['set-cookie'];
  });

  it('1. allows initial administrator to provision a second administrator via API', async () => {
    const res = await request(app)
      .post('/api/auth/administrators')
      .set('Cookie', admin1Cookie)
      .send({
        name: 'Co-Curator Ananya',
        email: 'ananya@artstudio.in',
        password: 'SecureAdminPass@2026',
        phone: '+91 9876543210'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.administrator.email).toBe('ananya@artstudio.in');
    expect(res.body.administrator.role).toBe('ADMIN');

    // Verify in database
    const dbAdmin = await User.findOne({ email: 'ananya@artstudio.in' });
    expect(dbAdmin).toBeDefined();
    expect(dbAdmin.role).toBe('ADMIN');
  });

  it('2. blocks regular customers and unauthenticated users from provisioning administrators', async () => {
    // Customer attempt
    const custRes = await request(app)
      .post('/api/auth/administrators')
      .set('Cookie', customerCookie)
      .send({
        name: 'Malicious Attempt',
        email: 'hacker@artstudio.in',
        password: 'Password123'
      });
    expect(custRes.status).toBe(403);
    expect(custRes.body.success).toBe(false);

    // Unauthenticated attempt
    const anonRes = await request(app)
      .post('/api/auth/administrators')
      .send({
        name: 'Anon Attempt',
        email: 'anon@artstudio.in',
        password: 'Password123'
      });
    expect(anonRes.status).toBe(401);
    expect(anonRes.body.success).toBe(false);
  });

  it('3. strictly prevents public registration from granting ADMIN role (role tampering defense)', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Customer Sneak',
        email: 'sneak@customer.in',
        password: 'Password123',
        confirmPassword: 'Password123',
        role: 'ADMIN' // Client supplies ADMIN
      });

    expect(regRes.status).toBe(201);
    // Server must strictly enforce CUSTOMER role
    expect(regRes.body.user.role).toBe('CUSTOMER');

    const dbUser = await User.findOne({ email: 'sneak@customer.in' });
    expect(dbUser.role).toBe('CUSTOMER');
  });

  it('4. strictly prevents customers from elevating role via profile update', async () => {
    const updateRes = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', customerCookie)
      .send({
        role: 'ADMIN'
      });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body.message).toMatch(/Modifying account role is strictly prohibited/i);
  });

  it('5. allows two different administrators to log in independently with their own credentials', async () => {
    // Create second admin
    await User.create({
      name: 'Curator Dev',
      email: 'dev@artstudio.in',
      password: 'DevSecurePassword@123',
      role: 'ADMIN'
    });

    // Login Admin 1
    const login1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin1@artstudio.in', password: 'password123' });
    expect(login1.status).toBe(200);
    expect(login1.body.user.email).toBe('admin1@artstudio.in');
    expect(login1.body.user.role).toBe('ADMIN');

    // Login Admin 2
    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dev@artstudio.in', password: 'DevSecurePassword@123' });
    expect(login2.status).toBe(200);
    expect(login2.body.user.email).toBe('dev@artstudio.in');
    expect(login2.body.user.role).toBe('ADMIN');
  });

  it('6. verifies shared management: painting created by Admin 1 is visible and editable by Admin 2', async () => {
    // Create second admin
    await User.create({
      name: 'Curator Dev',
      email: 'dev@artstudio.in',
      password: 'DevSecurePassword@123',
      role: 'ADMIN'
    });

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dev@artstudio.in', password: 'DevSecurePassword@123' });
    admin2Cookie = login2.headers['set-cookie'];

    // Admin 1 creates a painting
    const createRes = await request(app)
      .post('/api/paintings')
      .set('Cookie', admin1Cookie)
      .send({
        id: 'p-shared-test',
        title: 'Shared Masterpiece by Admin 1',
        artist: 'Gond Master',
        price: 22000,
        imageUrl: 'images/p-001.jpg',
        category: 'Gond'
      });
    expect(createRes.status).toBe(201);

    // Admin 2 fetches all paintings including archived
    const admin2List = await request(app)
      .get('/api/paintings?includeArchived=true')
      .set('Cookie', admin2Cookie);
    expect(admin2List.status).toBe(200);
    const sharedPainting = admin2List.body.paintings.find((p) => p.id === 'p-shared-test');
    expect(sharedPainting).toBeDefined();
    expect(sharedPainting.title).toBe('Shared Masterpiece by Admin 1');

    // Admin 2 edits the painting
    const editRes = await request(app)
      .patch('/api/paintings/p-shared-test')
      .set('Cookie', admin2Cookie)
      .send({
        title: 'Collaborative Masterpiece Updated by Admin 2',
        price: 25000
      });
    expect(editRes.status).toBe(200);
    expect(editRes.body.painting.title).toBe('Collaborative Masterpiece Updated by Admin 2');

    // Customer sees the updated shared painting in public catalogue
    const publicList = await request(app).get('/api/paintings');
    expect(publicList.status).toBe(200);
    const publicPainting = publicList.body.paintings.find((p) => p.id === 'p-shared-test');
    expect(publicPainting).toBeDefined();
    expect(publicPainting.title).toBe('Collaborative Masterpiece Updated by Admin 2');
    expect(publicPainting.price).toBe(25000);
  });

  it('7. allows administrator to view the full team list of all active administrators', async () => {
    // Provision a second admin
    await User.create({
      name: 'Curator Dev',
      email: 'dev@artstudio.in',
      password: 'DevSecurePassword@123',
      role: 'ADMIN'
    });

    const res = await request(app)
      .get('/api/auth/administrators')
      .set('Cookie', admin1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.administrators.length).toBe(2);

    const emails = res.body.administrators.map((a) => a.email);
    expect(emails).toContain('admin1@artstudio.in');
    expect(emails).toContain('dev@artstudio.in');
  });
});
