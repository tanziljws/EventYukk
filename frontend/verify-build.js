// Verify build output exists
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, 'dist');
const indexPath = join(distPath, 'index.html');
const assetsPath = join(distPath, 'assets');

if (!existsSync(distPath)) {
  console.error('❌ ERROR: dist folder not created!');
  process.exit(1);
}

if (!existsSync(indexPath)) {
  console.error('❌ ERROR: index.html not found!');
  process.exit(1);
}

if (!existsSync(assetsPath)) {
  console.error('❌ ERROR: assets folder not found!');
  process.exit(1);
}

console.log('✅ Build verification successful');
console.log(`📁 dist folder: ${distPath}`);
console.log(`📄 index.html: ${indexPath}`);
console.log(`📦 assets folder: ${assetsPath}`);

