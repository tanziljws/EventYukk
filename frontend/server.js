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
if (!existsSync(DIST_PATH)) {
  console.error(`❌ ERROR: dist folder not found at ${DIST_PATH}`);
  console.error(`📁 Current directory: ${__dirname}`);
  console.error(`📂 Files in current directory:`, readdirSync(__dirname));
} else {
  console.log(`✅ dist folder found at: ${DIST_PATH}`);
  const distFiles = readdirSync(DIST_PATH);
  console.log(`📦 Files in dist:`, distFiles);
  if (existsSync(path.join(DIST_PATH, 'assets'))) {
    const assetsFiles = readdirSync(path.join(DIST_PATH, 'assets'));
    console.log(`📦 Files in assets:`, assetsFiles);
  }
}

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
app.use('/assets', express.static(path.join(DIST_PATH, 'assets'), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
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
    return res.status(404).send('File not found');
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

