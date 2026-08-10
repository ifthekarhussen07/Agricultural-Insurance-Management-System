const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * Reads DB_URI from environment variables.
 * Exits the process on connection failure so the server
 * never starts in a broken state.
 */
const connectDB = async () => {
  try {
    const uri = process.env.DB_URI;

    if (!uri) {
      console.error('ERROR: DB_URI environment variable is not set.');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
