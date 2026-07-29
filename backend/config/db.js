const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI specified in environment variables.
 * Retries are handled by mongoose internally; on fatal errors we exit.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose (>=6) has sensible defaults; explicit options kept minimal.
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
