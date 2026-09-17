const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusradar';
    
    // Attempt standard connection with 3000ms selection timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log(`[CampusRadar DB] Connected to local MongoDB: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[CampusRadar DB] Could not connect to local MongoDB (${error.message}).`);
    console.log(`[CampusRadar DB] Initializing MongoMemoryServer for zero-config prototype environment...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[CampusRadar DB] Connected to In-Memory MongoDB instance successfully! (${inMemoryUri})`);
    } catch (memErr) {
      console.error(`[CampusRadar DB] Fatal error connecting to database. Please set a valid remote MONGODB_URI.`, memErr);
      // Removed process.exit(1) to prevent Vercel 500 crashes
    }
  }
};

module.exports = connectDB;
