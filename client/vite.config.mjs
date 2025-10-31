import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: update repo name if it's different on GitHub
export default defineConfig({
  base: '/surprisevista-fullstack/', 
  plugins: [react()],
})
