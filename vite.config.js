import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    include: ["xlsx/dist/xlsx.full.min.js"]
  },
  build: {
    rollupOptions: {
      external: ["xlsx"]
    }
  }
})
