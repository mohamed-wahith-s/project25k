const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./db');
const { startSubscriptionExpiryJob } = require('./jobs/subscriptionExpiry');

dotenv.config({ path: path.join(__dirname, '.env') });

const collegeRoutes = require('./routes/collegeRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('PathFinder Supabase Backend is running ✅');
});

// Health check endpoint (used by keep-alive cron)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database Connection & Server Startup
const startServer = async () => {
  try {
    await connectDB();

    // Start background jobs
    startSubscriptionExpiryJob();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

