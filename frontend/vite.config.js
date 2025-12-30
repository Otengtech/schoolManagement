import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/",
  // This handles SPA routing during development
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})