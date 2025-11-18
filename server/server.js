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

// Check for frontend dist path first (before CORS setup)
const possibleFrontendPaths = [
  path.join(__dirname, 'frontend-dist'), // Copied in Dockerfile
  path.join(__dirname, '..', 'frontend', 'dist'), // Development path
  path.join(__dirname, 'dist') // Alternative path
];

let frontendDistPath = null;
for (const frontendPath of possibleFrontendPaths) {
  if (require('fs').existsSync(frontendPath)) {
    frontendDistPath = frontendPath;
    console.log(`✅ Frontend found at: ${frontendPath}`);
    break;
  }
}

// CORS configuration - Single domain approach (frontend served from backend)
// If frontend is served from same domain, CORS is not needed for same-origin requests
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

// Add FRONTEND_URL if set (for separate frontend deployment)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Check if frontend is served from same domain (single domain mode)
const isSingleDomainMode = frontendDistPath !== null;

if (isSingleDomainMode) {
  // Single domain mode: Frontend served from backend, no CORS needed for same-origin
  console.log('🌐 Single domain mode: Frontend served from backend - CORS disabled for same-origin');
  // Minimal CORS - only for external API calls if needed
  app.use(cors({
    origin: function (origin, callback) {
      // Same-origin requests don't send Origin header - allow them
      if (!origin) return callback(null, true);
      
      // Allow localhost for development
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // In single domain mode, same-origin requests are automatically allowed
      // Only allow explicit origins for external access
      callback(null, true);
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
  // Separate domain mode: Frontend and backend on different domains
  console.log('🌐 Separate domain mode: CORS enabled');
  if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (origin.includes('.railway.app')) {
          return callback(null, true);
        }
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

// Serve frontend static files (if frontend is built and copied to server)
// IMPORTANT: This must be BEFORE API routes to ensure static files are served correctly
if (frontendDistPath) {
  // Serve static assets (CSS, JS, images, etc.) with proper MIME types
  // Use explicit path matching to avoid conflicts
  app.use('/assets', (req, res, next) => {
    // Log asset requests for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Serving asset: ${req.path}`);
    }
    next();
  }, express.static(path.join(frontendDistPath, 'assets'), {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    },
    fallthrough: false // Don't fall through to next middleware if file not found
  }));
  
  // Serve other static files (manifest, icons, etc.) - but NOT index.html
  app.use(express.static(frontendDistPath, {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    },
    // Don't serve index.html here - we'll handle it in SPA routing
    index: false,
    fallthrough: true // Allow fallthrough for SPA routing
  }));
  
  console.log(`✅ Frontend static files configured from: ${frontendDistPath}`);
} else {
  console.log('⚠️ Frontend dist not found - API only mode');
}

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

// Serve frontend SPA for all non-API routes (must be after all API routes)
// IMPORTANT: This must be LAST, after all static file serving
if (frontendDistPath) {
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Skip uploads
    if (req.path.startsWith('/uploads/')) {
      return next();
    }
    // Skip static assets (they should be served by express.static above)
    if (req.path.startsWith('/assets/') || 
        req.path.startsWith('/vite.svg') || 
        req.path.startsWith('/manifest.json') ||
        req.path.endsWith('.js') ||
        req.path.endsWith('.css') ||
        req.path.endsWith('.json')) {
      return next();
    }
    // Serve index.html for all other routes (SPA routing)
    const indexPath = path.join(frontendDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        next();
      }
    });
  });
}

// 404 handler (only for API routes if frontend not found)
app.use('*', (req, res) => {
  // If it's an API route, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
  // For non-API routes, if frontend not found, return 404
  if (!frontendDistPath) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
  // Frontend should handle this, but just in case
  res.status(404).send('Not found');
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

