import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
   build: {
    sourcemap: false, // Enable source maps
  },
  chunkSizeWarningLimit: 500,
  test: {
    environment: 'node',
  },
})
