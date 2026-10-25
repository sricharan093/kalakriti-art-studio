import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Painting } from '../models/Painting.js';
import { StudioMeta } from '../models/StudioMeta.js';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const findSeedFile = () => {
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'seed-data', 'seedData', 'seed.json'),
    path.join(__dirname, '..', '..', 'seed-data', 'seed.json'),
    path.join(__dirname, '..', 'seed-data', 'seed.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

export const runSeed = async () => {
  console.log('[Seed Importer] Starting seed data import...');
  const seedFilePath = findSeedFile();
  if (!seedFilePath) {
    throw new Error('Could not find seed.json in seed-data directory.');
  }

  const raw = fs.readFileSync(seedFilePath, 'utf8');
  const seedData = JSON.parse(raw);

  await connectDB();

  // 1. Seed Studio Metadata (pottery items, glazes, mural rate, currency)
  const metaDoc = {
    key: 'studio_config',
    currency: seedData.currency || 'INR',
    muralRatePerSqFt: seedData.mural?.ratePerSqFt || 150,
    potteryItems: seedData.potteryItems || [],
    glazes: seedData.glazes || []
  };

  await StudioMeta.findOneAndUpdate(
    { key: 'studio_config' },
    { $set: metaDoc },
    { upsert: true, new: true }
  );
  console.log(`[Seed Importer] Saved studio config: Mural rate = ₹${metaDoc.muralRatePerSqFt}/sq.ft, ${metaDoc.potteryItems.length} pottery items, ${metaDoc.glazes.length} glazes.`);

  // 2. Seed Paintings (idempotent: avoid overwriting existing/sold state on rerun)
  let paintingsInserted = 0;
  let paintingsUpdated = 0;

  for (const p of seedData.paintings || []) {
    const existing = await Painting.findOne({ id: p.id });
    if (!existing) {
      await Painting.create({
        id: p.id,
        title: p.title,
        artist: p.artist,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        status: p.status || 'available'
      });
      paintingsInserted++;
    } else {
      // If painting exists, preserve current status if it was sold during app usage
      existing.title = p.title;
      existing.artist = p.artist;
      existing.description = p.description;
      existing.price = p.price;
      existing.imageUrl = p.imageUrl;
      // only keep initial status if record was untouched
      await existing.save();
      paintingsUpdated++;
    }
  }
  console.log(`[Seed Importer] Paintings: ${paintingsInserted} new records inserted, ${paintingsUpdated} records synchronized.`);

  // 3. Seed Studio Admin Account from seed.json or environment
  const adminEmail = (process.env.ADMIN_EMAIL || seedData.studioAccount?.email || 'studio@artstudio.in').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || seedData.studioAccount?.password || 'Studio@123';
  const adminName = process.env.ADMIN_NAME || 'Studio Administrator';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN'
    });
    await adminUser.save();
    console.log(`[Seed Importer] Created default Studio Admin account: ${adminEmail}`);
  } else {
    console.log(`[Seed Importer] Studio Admin account already exists: ${adminEmail}`);
  }

  console.log('[Seed Importer] Database seeding completed successfully.');
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[Seed Importer Error] ${err.message}`);
      process.exit(1);
    });
}
