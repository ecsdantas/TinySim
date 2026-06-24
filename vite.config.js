import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    keepNames: true, // Preserve class/function names so runtime lookups by constructor.name survive minification
  },
   build: {
    sourcemap: false, // Enable source maps
  },
  chunkSizeWarningLimit: 500,
  test: {
    environment: 'happy-dom', // @projectstorm/react-diagrams expects browser globals (self, window)
  },
})
