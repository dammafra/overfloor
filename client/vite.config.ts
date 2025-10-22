import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import restart from 'vite-plugin-restart'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    restart({ restart: ['../server/src/schema/**'] }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    glsl(),
  ],
  server: {
    // host: true,
  },
  build: {
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  resolve: {
    alias: {
      '@shaders': path.resolve(__dirname, 'src/shaders'),
    },
  },
})
