import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';

describe('Authentication & RBAC Tests', () => {
  it('registers a customer successfully and ignores role escalation attempts', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'ADMIN' // Client attempt to escalate role
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('CUSTOMER'); // Must be forced to CUSTOMER
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.body.user.password).toBeUndefined(); // Never return password hash

    // Verify in database that password was hashed
    const dbUser = await User.findOne({ email: 'john@example.com' });
    expect(dbUser).toBeDefined();
    expect(dbUser.role).toBe('CUSTOMER');
    expect(dbUser.password).not.toBe('password123');
    expect(dbUser.password.startsWith('$2')).toBe(true); // bcrypt hash
  });

  it('rejects duplicate email registrations with 409 Conflict', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects password shorter than 8 characters or mismatched confirmation', async () => {
    const resShort = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123',
        confirmPassword: '123'
      });
    expect(resShort.status).toBe(400);

    const resMismatch = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Mismatch',
        email: 'mismatch@example.com',
        password: 'password123',
        confirmPassword: 'password456'
      });
    expect(resMismatch.status).toBe(400);
  });

  it('logs in successfully and sets HttpOnly cookie with JWT', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('CUSTOMER');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find((c) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain('HttpOnly');
  });

  it('rejects invalid login credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('restores user session via GET /api/auth/me with valid cookie and rejects unauthenticated', async () => {
    // Register and login to get cookie
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Session User',
        email: 'session@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'session@example.com',
        password: 'password123'
      });

    const cookie = loginRes.headers['set-cookie'];

    // Unauthenticated request should fail with 401
    const unauthRes = await request(app).get('/api/auth/me');
    expect(unauthRes.status).toBe(401);

    // Authenticated request with cookie should succeed
    const authRes = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(authRes.status).toBe(200);
    expect(authRes.body.user.email).toBe('session@example.com');
  });

  it('enforces RBAC: prevents customer from accessing admin routes with 403 Forbidden', async () => {
    // Register customer
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular Customer',
        email: 'cust@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'cust@example.com',
        password: 'password123'
      });

    const customerCookie = loginRes.headers['set-cookie'];

    // Customer attempting to call admin endpoint
    const adminRes = await request(app)
      .get('/api/admin/orders')
      .set('Cookie', customerCookie);

    expect(adminRes.status).toBe(403);
  });

  it('logs out and clears authentication cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    // Cookie cleared
    expect(cookies[0]).toMatch(/token=;/);
  });

  it('allows authenticated customer to view and update permitted profile fields and default address', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Anita Roy',
        email: 'anita@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'anita@example.com',
        password: 'password123'
      });
    const cookie = loginRes.headers['set-cookie'];

    // 1. GET /api/auth/profile
    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', cookie);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.name).toBe('Anita Roy');
    expect(profileRes.body.user.email).toBe('anita@example.com');
    expect(profileRes.body.user.role).toBe('CUSTOMER');

    // 2. PUT /api/auth/profile with new contact phone, theme, and default address
    const updateRes = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', cookie)
      .send({
        name: 'Anita Roy Sharma',
        phone: '9876543210',
        themePreference: 'dark',
        defaultAddress: {
          fullName: 'Anita Sharma',
          phone: '9876543210',
          streetAddress: 'Flat 101, Galaxy Enclave',
          addressLine2: 'Near Central Park',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001'
        }
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.user.name).toBe('Anita Roy Sharma');
    expect(updateRes.body.user.phone).toBe('9876543210');
    expect(updateRes.body.user.themePreference).toBe('dark');
    expect(updateRes.body.user.defaultAddress.city).toBe('Jaipur');
    expect(updateRes.body.user.defaultAddress.postalCode).toBe('302001');

    // 3. Reject role modification attempt with 403 Forbidden
    const escalateRes = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', cookie)
      .send({
        role: 'ADMIN'
      });

    expect(escalateRes.status).toBe(403);
    expect(escalateRes.body.success).toBe(false);
  });

  it('rejects invalid phone and PIN code in profile default address updates', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Val',
        email: 'testval@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testval@example.com',
        password: 'password123'
      });
    const cookie = loginRes.headers['set-cookie'];

    // Invalid phone (doesn't start with 6-9)
    const badPhoneRes = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', cookie)
      .send({
        phone: '1234567890'
      });
    expect(badPhoneRes.status).toBe(400);

    // Invalid PIN code (not 6 digits or starts with 0)
    const badPinRes = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', cookie)
      .send({
        defaultAddress: {
          fullName: 'Valid Name',
          phone: '9876543210',
          streetAddress: '123 Valid St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '001234'
        }
      });
    expect(badPinRes.status).toBe(400);
  });

  it('rejects customer account from logging in via Administrator Login (expectedRole: ADMIN) with 403', async () => {
    // 1. Create a customer
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular Customer',
        email: 'customer.admincheck@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

    // 2. Attempt login with expectedRole: 'ADMIN'
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer.admincheck@example.com',
        password: 'password123',
        expectedRole: 'ADMIN'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('This account does not have administrator access. Please use Customer Login.');

    // Verify no cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeUndefined();
  });

  it('allows administrator account to log in with expectedRole: ADMIN successfully', async () => {
    // 1. Create an admin
    const adminUser = new User({
      name: 'System Admin',
      email: 'system.admin@artstudio.in',
      password: 'AdminPassword123',
      role: 'ADMIN'
    });
    await adminUser.save();

    // 2. Log in with expectedRole: 'ADMIN'
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'system.admin@artstudio.in',
        password: 'AdminPassword123',
        expectedRole: 'ADMIN'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.user.email).toBe('system.admin@artstudio.in');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('allows administrator account to log in without expectedRole and preserves ADMIN role', async () => {
    const adminUser = new User({
      name: 'Preserved Admin',
      email: 'preserved.admin@artstudio.in',
      password: 'AdminPassword123',
      role: 'ADMIN'
    });
    await adminUser.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'preserved.admin@artstudio.in',
        password: 'AdminPassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
  });
});

