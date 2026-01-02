import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],

    server: {
      // Only use proxy in development
      proxy: mode === 'development' ? {
        '/api': {
          target: 'https://school-management-system-backend-three.vercel.app',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});
