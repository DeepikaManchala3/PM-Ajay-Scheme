const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Try loading .env from backend folder first, then root folder
const localEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
  console.log('✅ Loaded environment from backend/.env');
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  console.log('✅ Loaded environment from ../.env (root)');
} else {
  console.log('⚠️ No .env file found!');
  dotenv.config();
}

console.log('Supabase Config Check:', process.env.SUPABASE_URL ? 'URL Found' : 'URL Missing');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fundRoutes = require('./routes/fundRoutes');
const stateAdminRoutes = require('./routes/stateAdminRoutes');
const proposalRoutes = require('./routes/proposalRoutes');

const app = express();
const PORT = 5001; // process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/state-admins', stateAdminRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/district-admins', require('./routes/districtAdminRoutes'));
app.use('/api/implementing-agencies', require('./routes/implementingAgencyRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/monitor', require('./routes/monitorRoutes'));
app.use('/api/circulars', require('./routes/circularRoutes'));
app.use('/api/ucs', require('./routes/ucRoutes'));
app.use('/api/villages', require('./routes/villageRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running correctly with Routes and Controllers',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`- Auth Routes loaded at /api/auth`);
  console.log(`- Notification Routes loaded at /api/notifications`);
  console.log(`- Fund Routes loaded at /api/funds`);
  console.log(`- State Admin Routes loaded at /api/state-admins`);
  console.log(`- Health check at /api/health`);
});

// Start Background Services
// Cron reminder service for pending proposals + approval notifications
const cronService = require('./services/cronService');
cronService.startScheduler();
