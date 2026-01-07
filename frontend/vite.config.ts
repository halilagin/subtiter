import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    https: true,
    host: true
  },
  publicDir: 'public', // Explicitly set public directory
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: [
        /\/auth-cli\.ts$/,
        /\/document-cli\.ts$/
      ]
    }
  },
  optimizeDeps: {
    include: ['react-beautiful-wheel-picker'],
    exclude: []
  }
}) 
