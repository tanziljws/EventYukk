const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
// Load environment variables - try config.env first, then fallback to process.env (for Railway)
try {
  require('dotenv').config({ path: './config.env' });
} catch (e) {
  // If config.env doesn't exist (e.g., in Railway), use process.env directly
  console.log('📝 Using environment variables from process.env (Railway/Production mode)');
}
const { initCronJobs } = require('./utils/cronJobs');
const { archiveEndedEvents } = require('./utils/eventCleanup');
const { runMigrations } = require('./migrations/runMigration');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - flexible for Railway deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

// Add FRONTEND_URL if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// In production/Railway, allow Railway domains
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
  // Allow all Railway domains
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow Railway domains
      if (origin.includes('.railway.app')) {
        return callback(null, true);
      }
      
      // Allow custom domain if set
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cache-Control', 
      'Pragma', 
      'Expires',
      'X-Requested-With'
    ]
  }));
} else {
  // Development: strict CORS
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cache-Control', 
      'Pragma', 
      'Expires',
      'X-Requested-With'
    ]
  }));
}

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const registrationRoutes = require('./routes/registrations');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const articlesRoutes = require('./routes/articles');
const blogsRoutes = require('./routes/blogs');
const contactsRoutes = require('./routes/contacts');
const contactRoutes = require('./routes/contact');
const historyRoutes = require('./routes/history');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payments');
const attendanceRoutes = require('./routes/attendance');
const certificateRoutes = require('./routes/certificates');
const performersRoutes = require('./routes/performers');
const reviewsRoutes = require('./routes/reviews');
const reportsRoutes = require('./routes/reports');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/performers', performersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin/reports', reportsRoutes);

console.log('✅ Reports routes registered at /api/admin/reports');

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log('✅ All routes registered successfully\n');
  
  // Run database migrations first
  console.log('🔄 Running database migrations...');
  try {
    await runMigrations();
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  // Run initial cleanup on server start
  console.log('🧹 Running initial event archival...');
  try {
    const result = await archiveEndedEvents();
    console.log(`✅ Initial archival complete: ${result.archived} events archived`);
  } catch (error) {
    console.error('❌ Initial archival failed:', error);
  }
  
  // Initialize cron jobs for automatic archival
  initCronJobs();
});

module.exports = app;

