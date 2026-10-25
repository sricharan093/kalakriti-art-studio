import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export async function setup() {
  // 1. Try local MongoDB if available (instant execution)
  try {
    const testConn = await mongoose.createConnection('mongodb://localhost:27017/artstudio_test', {
      serverSelectionTimeoutMS: 2000
    }).asPromise();
    await testConn.close();
    process.env.MONGO_URI = 'mongodb://localhost:27017/artstudio_test';
    console.log('[Test Setup] Using local MongoDB at mongodb://localhost:27017/artstudio_test');
    return;
  } catch (err) {
    // Local MongoDB not running, fallback to memory server
  }

  // 2. Fallback to MongoMemoryServer
  console.log('[Test Setup] Starting MongoMemoryServer (downloading if needed, please wait)...');
  mongoServer = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 120000
    }
  });
  process.env.MONGO_URI = mongoServer.getUri();
  console.log(`[Test Setup] MongoMemoryServer ready at ${process.env.MONGO_URI}`);
}

export async function teardown() {
  if (mongoServer) {
    console.log('[Test Teardown] Stopping MongoMemoryServer...');
    await mongoServer.stop();
  }
}
