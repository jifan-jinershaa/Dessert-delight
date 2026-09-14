const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dessert_delight';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // 3 seconds timeout
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${uri}.`);
    console.warn(`[MongoDB Warning] Error: ${error.message}`);
    console.info(`[Info] Operating in resilient mode: Data will be safely stored in-memory for testing/demo.`);
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
