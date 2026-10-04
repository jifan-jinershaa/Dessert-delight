const mongoose = require('mongoose');

const isProd = process.env.NODE_ENV === 'production';

// True only while the driver is actually connected (also handles dropped connections).
const isDBConnected = () => mongoose.connection.readyState === 1;

/**
 * Production: MONGODB_URI is required and a failed connection throws, so the
 * platform restarts/reports the service instead of silently losing data.
 * Development: falls back to in-memory storage if MongoDB isn't running.
 * (The connection string is never logged because it contains the password.)
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || (isProd ? '' : 'mongodb://localhost:27017/dessert_delight');
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to your environment variables.');

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: isProd ? 15000 : 3000 });
    console.log(`[MongoDB] Connected to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    if (isProd) throw error;
    console.warn(`[MongoDB Warning] Could not connect: ${error.message}`);
    console.info('[Info] Development mode: using in-memory storage (data is lost on restart).');
    return false;
  }
}

module.exports = { connectDB, isDBConnected };
