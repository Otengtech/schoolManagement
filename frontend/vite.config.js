import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    // This is the key for development - redirects all routes to index.html
    historyApiFallback: {
      disableDotRule: true,
    },
    // Also ensure proper hot reloading
    hmr: {
      overlay: true,
    },
    // Enable cors if needed
    cors: true,
  },
  // For production build
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // This helps with cache busting and clean paths
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  }
})