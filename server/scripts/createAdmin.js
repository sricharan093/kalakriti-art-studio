import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
};

const createAdmin = async () => {
  try {
    const cliArgs = parseArgs();

    const name = cliArgs.name || process.env.NEW_ADMIN_NAME || process.env.ADMIN_NAME || 'Studio Co-Administrator';
    const email = (cliArgs.email || process.env.NEW_ADMIN_EMAIL || '').toLowerCase().trim();
    const password = cliArgs.password || process.env.NEW_ADMIN_PASSWORD || '';
    const phone = cliArgs.phone || '';

    if (!email || !password) {
      console.log(`
============================================================
KALAKRITI ART STUDIO — CLI ADMINISTRATOR PROVISIONING TOOL
============================================================
Usage:
  node scripts/createAdmin.js --name "Admin Name" --email "admin@artstudio.in" --password "SecurePass123" [--phone "9876543210"]

Or via npm:
  npm run create:admin -- --name "Admin Name" --email "admin@artstudio.in" --password "SecurePass123"

Parameters:
  --name      Full Name of administrator (default: "Studio Co-Administrator")
  --email     Valid, unique email address (Required)
  --password  Password (minimum 8 characters) (Required)
  --phone     Optional contact phone number
============================================================
`);
      process.exit(1);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error(`Invalid email address format: ${email}`);
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log(`[Admin Provisioning] Administrator account with email "${email}" already exists.`);
        if (cliArgs.updatePassword) {
          existingUser.password = password;
          if (name) existingUser.name = name;
          await existingUser.save();
          console.log(`[Admin Provisioning] Password for administrator "${email}" has been updated.`);
        } else {
          console.log(`[Admin Provisioning] Existing account preserved. Pass --updatePassword to update password.`);
        }
        await mongoose.disconnect();
        process.exit(0);
      } else {
        if (!cliArgs.promote) {
          console.error(`[Admin Provisioning Error] Account with email "${email}" already exists with role "CUSTOMER".`);
          console.error(`To prevent accidental silent role elevation, pass "--promote" to explicitly convert this account to ADMIN.`);
          await mongoose.disconnect();
          process.exit(1);
        }
        console.log(`[Admin Provisioning] User found with role '${existingUser.role}'. Promoting to 'ADMIN' via explicit --promote flag...`);
        existingUser.role = 'ADMIN';
        existingUser.name = name || existingUser.name;
        existingUser.password = password; // pre-save hook will hash
        if (phone) existingUser.phone = phone;
        await existingUser.save();
        console.log(`[Admin Provisioning] Successfully promoted "${email}" to ADMIN!`);
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    const newAdmin = new User({
      name: name.trim(),
      email,
      password, // pre-save hook hashes with bcrypt
      phone: phone.trim(),
      role: 'ADMIN'
    });

    await newAdmin.save();

    console.log(`
============================================================
SUCCESS: New Administrator Account Provisioned!
============================================================
Name:     ${newAdmin.name}
Email:    ${newAdmin.email}
Role:     ${newAdmin.role}
Account ID: ${newAdmin._id}
Created:  ${newAdmin.createdAt}
============================================================
This administrator can now log in independently at /login
and manage the shared studio inventory and client services.
============================================================
`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Admin Provisioning Error] ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

createAdmin();
