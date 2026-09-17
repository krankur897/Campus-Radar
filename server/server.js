const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const seedAllData = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const placementRoutes = require('./routes/placementRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const clubRoutes = require('./routes/clubRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'CampusRadar API Server', timestamp: new Date().toISOString() });
});

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  
  const page = req.path === '/' ? 'index.html' : (req.path.endsWith('.html') ? req.path : `${req.path}.html`);
  const filePath = path.join(clientPath, page);
  
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(clientPath, 'index.html'));
  });
});

// Initialize DB connection (Mongoose buffers queries until connected)
const initDB = async () => {
  try {
    await connectDB();
    const Event = require('./models/Event');
    const eventCount = await Event.countDocuments({});
    if (eventCount === 0) {
      console.log('[CampusRadar Server] Database empty. Running seed script...');
      await seedAllData();
    }
  } catch (err) {
    console.error('[CampusRadar Server] Database initialization error:', err);
  }
};

// Start Express server locally if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
==========================================================
 🚀 CAMPUSRADAR BACKEND SERVER IS RUNNING
==========================================================
 Port:        ${PORT}
 Web UI:      http://localhost:${PORT}
 Healthcheck: http://localhost:${PORT}/api/health
==========================================================
    `);
    initDB();
  });
} else {
  // Export app for serverless execution (e.g. Vercel)
  initDB();
  module.exports = app;
}
