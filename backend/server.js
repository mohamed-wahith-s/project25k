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
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(express.json());         // parse JSON request bodies

// ─── CORS ────────────────────────────────────────────────────────────────────
// Requests from the S3-hosted frontend (collegediaries.in) arrive with
// Origin: https://collegediaries.in — this allowlist must include that value.
//
// ⚠️  404 FROM DEPLOYED FRONTEND BUT NOT LOCALHOST?
// That means the domain "api.collegediaries.in" is not reaching this Express
// process. Express is listening on :5000.  You need nginx on EC2 to proxy:
//   server_name api.collegediaries.in;
//   location / { proxy_pass http://127.0.0.1:5000; }
// Without that, HTTPS requests to api.collegediaries.in return 404 / timeout.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://collegediaries.in',
  'https://www.collegediaries.in',
  'https://admin.collegediaries.in',   // admin panel if hosted separately
  'http://localhost:5173',             // Vite dev – main frontend
  'http://localhost:5174',             // Vite dev – admin frontend
  'http://localhost:3000',             // CRA / other local dev
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow configured origins OR any local development origin
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');   // tell CDN/proxies the response varies by origin
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});


// Routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

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


