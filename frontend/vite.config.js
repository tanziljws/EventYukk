import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // Use new JSX transform
      jsxImportSource: 'react'
    })
  ],
  // Expose environment variables to frontend
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  },
  build: {
    // Ensure all CSS is bundled
    cssCodeSplit: false, // Bundle all CSS into single file
    rollupOptions: {
      output: {
        // Ensure consistent file naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Force rebuild to update hashes
    emptyOutDir: true
  },
  // Prevent CSS from being split
  css: {
    postcss: {
      plugins: []
    }
  }
})
