import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Mirror the Nginx gateway: only the catalogue lives on
    // book-management-service (8081); basket, orders and admin orders all live
    // on order-service (8083). More specific prefix (/api/v1/books) first.
    proxy: {
      '/api/v1/books': 'http://localhost:8081',
      '/api': 'http://localhost:8083',
    },
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/utils/**'],
    },
  },
})
