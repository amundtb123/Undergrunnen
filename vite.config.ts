/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@engine': path.resolve(import.meta.dirname, 'supabase/functions/_shared/engine'),
    },
  },
  server: { host: true, port: 5173 },
  test: { include: ['tests/**/*.test.ts'] },
})
