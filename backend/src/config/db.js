const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Ensure MONGO_URI exists in the .env file.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1); // Exit app if database connection fails.
  }
};

module.exports = connectDB;
