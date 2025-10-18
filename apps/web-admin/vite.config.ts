import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@chotter/database': path.resolve(__dirname, '../../packages/database/src'),
      '@chotter/utils': path.resolve(__dirname, '../../packages/utils/src'),
    }
  }
})
