// Simple Express server untuk serve frontend static files dengan proper MIME types
// Digunakan jika frontend di-deploy sebagai service terpisah di Railway

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5173;
const DIST_PATH = path.join(__dirname, 'dist');

// Logging middleware untuk debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Check if dist folder exists
let buildReady = false;
if (!existsSync(DIST_PATH)) {
  console.error(`❌ ERROR: dist folder not found at ${DIST_PATH}`);
  console.error(`📁 Current directory: ${__dirname}`);
  try {
    const files = readdirSync(__dirname);
    console.error(`📂 Files in current directory:`, files);
  } catch (err) {
    console.error(`❌ Cannot read directory:`, err);
  }
  console.error(`\n⚠️  CRITICAL: Build may have failed!`);
  console.error(`Please check Railway build logs to ensure 'npm run build' succeeded.`);
  console.error(`⚠️  Server will continue but will return errors for all requests.`);
  buildReady = false;
} else {
  console.log(`✅ dist folder found at: ${DIST_PATH}`);
  try {
    const distFiles = readdirSync(DIST_PATH);
    console.log(`📦 Files in dist:`, distFiles);
    
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (!existsSync(indexPath)) {
      console.error(`❌ ERROR: index.html not found in dist folder!`);
      buildReady = false;
    } else {
      const assetsPath = path.join(DIST_PATH, 'assets');
      if (existsSync(assetsPath)) {
        const assetsFiles = readdirSync(assetsPath);
        console.log(`📦 Files in assets (${assetsFiles.length} files):`, assetsFiles.slice(0, 10), assetsFiles.length > 10 ? '...' : '');
        
        // Check for critical files
        const hasJS = assetsFiles.some(f => f.endsWith('.js'));
        const hasCSS = assetsFiles.some(f => f.endsWith('.css'));
        
        if (!hasJS) {
          console.error(`❌ WARNING: No JS files found in assets!`);
        }
        if (!hasCSS) {
          console.error(`❌ WARNING: No CSS files found in assets!`);
        }
        
        if (hasJS && hasCSS) {
          console.log(`✅ Build verification: JS and CSS files found`);
          buildReady = true;
        } else {
          buildReady = false;
        }
      } else {
        console.error(`❌ ERROR: assets folder not found in dist!`);
        buildReady = false;
      }
    }
  } catch (err) {
    console.error(`❌ Error reading dist folder:`, err);
    buildReady = false;
  }
}

// If build is not ready, serve error page for all requests
if (!buildReady) {
  app.use('*', (req, res) => {
    res.status(500).json({
      error: 'Build not ready',
      message: 'Frontend build failed or not found. Please check Railway build logs.',
      distPath: DIST_PATH,
      currentDir: __dirname
    });
  });
  
  app.listen(PORT, () => {
    console.log(`⚠️  Frontend server running in ERROR MODE on port ${PORT}`);
    console.log(`📁 Expected dist at: ${DIST_PATH}`);
    console.log(`🌐 All requests will return build error`);
  });
  
  // Exit early - don't continue with normal setup
} else {
  // Normal setup continues below...
  
  // Serve static files dengan proper MIME types
// IMPORTANT: This must be before the catch-all route
app.use(express.static(DIST_PATH, {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath, stat) => {
    // Don't cache index.html - always serve fresh
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // Set proper MIME types untuk semua file types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    } else if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    } else if (filePath.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    } else if (filePath.endsWith('.eot')) {
      res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
    }
  },
  index: false // Don't serve index.html automatically
}));

// Explicit route untuk assets folder (untuk memastikan file di-serve)
app.use('/assets', (req, res, next) => {
  console.log(`📦 Asset request: ${req.path}`);
  next();
}, express.static(path.join(DIST_PATH, 'assets'), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  },
  fallthrough: false // Don't fall through if file not found
}));

// SPA routing - serve index.html untuk semua routes yang bukan static files
app.get('*', (req, res) => {
  // Skip API routes (jika ada)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Skip jika request untuk static files (seharusnya sudah di-handle oleh express.static)
  // Tapi kalau sampai di sini berarti file tidak ditemukan
  if (req.path.startsWith('/assets/') || 
      req.path.endsWith('.js') || 
      req.path.endsWith('.css') || 
      req.path.endsWith('.json') ||
      req.path.endsWith('.svg') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.jpeg') ||
      req.path.endsWith('.woff') ||
      req.path.endsWith('.woff2') ||
      req.path.endsWith('.ttf')) {
    console.error(`❌ Static file not found: ${req.path}`);
    console.error(`📁 Looking in: ${DIST_PATH}`);
    console.error(`📦 Assets folder: ${path.join(DIST_PATH, 'assets')}`);
    
    // Try to list what files actually exist
    try {
      if (existsSync(path.join(DIST_PATH, 'assets'))) {
        const actualFiles = readdirSync(path.join(DIST_PATH, 'assets'));
        console.error(`📦 Actual files in assets:`, actualFiles);
      }
    } catch (err) {
      console.error(`❌ Cannot list assets:`, err);
    }
    
    return res.status(404).json({ 
      error: 'File not found',
      path: req.path,
      distPath: DIST_PATH
    });
  }
  
  // Serve index.html untuk SPA routing
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`❌ index.html not found at: ${indexPath}`);
    res.status(500).send('index.html not found');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).send('Internal server error');
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📁 Serving from: ${DIST_PATH}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  
  // Verify critical files exist
  const indexPath = path.join(DIST_PATH, 'index.html');
  const assetsPath = path.join(DIST_PATH, 'assets');
  
  if (!existsSync(indexPath)) {
    console.error(`⚠️  WARNING: index.html not found at ${indexPath}`);
  } else {
    console.log(`✅ index.html found`);
  }
  
  if (!existsSync(assetsPath)) {
    console.error(`⚠️  WARNING: assets folder not found at ${assetsPath}`);
  } else {
    console.log(`✅ assets folder found`);
  }
  });
}

