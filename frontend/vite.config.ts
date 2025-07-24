import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['972d521e-542e-46ba-b686-674e34356d49.preview.emergentagent.com'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})