import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || 'Studio Administrator';
    const adminEmail = (process.env.ADMIN_EMAIL || 'studio@artstudio.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Studio@123';

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment');
    }

    if (adminPassword.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
    }

    await connectDB();

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log(`[Seed Admin] Admin account (${adminEmail}) already exists. Existing credentials preserved.`);
        process.exit(0);
      } else {
        console.log(`[Seed Admin] User exists with role '${existingUser.role}'. Promoting to ADMIN role.`);
        existingUser.role = 'ADMIN';
        await existingUser.save();
        console.log(`[Seed Admin] Account promoted to ADMIN successfully.`);
        process.exit(0);
      }
    }

    const newAdmin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // pre-save hook will hash it with bcrypt
      role: 'ADMIN'
    });

    await newAdmin.save();
    console.log(`[Seed Admin] Initial administrator created successfully.`);
    console.log(`[Seed Admin] Email: ${adminEmail}`);
    console.log(`[Seed Admin] Role: ADMIN`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Admin Error] ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
