import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base path - use root for production
  base: '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  },
  build: {
    // CRITICAL: Bundle ALL CSS into single file - NO SPLITTING
    cssCodeSplit: false,
    // Force new hash on every build
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Force CSS to single file
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/index-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    emptyOutDir: true,
    // Minify for production (esbuild is default, no extra dependency needed)
    minify: 'esbuild',
    // Ensure assets are in assets folder
    assetsDir: 'assets'
  },
  css: {
    // Ensure CSS is processed correctly
    devSourcemap: false
  }
})
