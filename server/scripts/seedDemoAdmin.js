import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const seedDemoAdmin = async () => {
  try {
    const name = process.env.DEMO_ADMIN_NAME || 'Administrator 1';
    const email = (process.env.DEMO_ADMIN_EMAIL || 'demo.admin@kalakriti.in').toLowerCase().trim();
    const password = process.env.DEMO_ADMIN_PASSWORD || 'KalaDemo@123';

    if (!email || !password) {
      throw new Error('DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD must be configured.');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error(`Invalid email address format: ${email}`);
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== 'ADMIN') {
        throw new Error(
          `Account with email "${email}" already exists with role "${existingUser.role}". ` +
          `Refusing to silently overwrite or promote existing customer account.`
        );
      }

      // Check if existing password matches, or update if requested via CLI flag --force
      const isMatch = await existingUser.comparePassword(password);
      if (isMatch) {
        console.log(`[Jury Admin Setup] Demo administrator "${email}" is already configured and verified with active credentials.`);
      } else {
        existingUser.name = name;
        existingUser.password = password; // pre-save hook will hash with bcrypt
        await existingUser.save();
        console.log(`[Jury Admin Setup] Existing administrator "${email}" credentials synchronized successfully.`);
      }

      await mongoose.disconnect();
      return;
    }

    // Create new dedicated administrator
    const newAdmin = new User({
      name: name.trim(),
      email,
      password, // pre-save hook hashes with bcrypt (10 rounds)
      role: 'ADMIN'
    });

    await newAdmin.save();

    console.log(`
============================================================
KALAKRITI ART STUDIO — JURY ADMINISTRATOR PROVISIONED
============================================================
Name:       ${newAdmin.name}
Email:      ${newAdmin.email}
Role:       ${newAdmin.role}
Database:   ${mongoose.connection.name}
Account ID: ${newAdmin._id}
Created At: ${newAdmin.createdAt}
============================================================
Notice: Password stored securely as salted bcrypt hash.
Credentials are ready for local jury evaluation.
============================================================
`);

    await mongoose.disconnect();
  } catch (error) {
    console.error(`[Jury Admin Setup Error] ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedDemoAdmin.js')) {
  seedDemoAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
