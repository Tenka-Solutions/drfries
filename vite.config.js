import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://drfries.cl:5000', // URL del backend de Getnet
        changeOrigin: true,
        secure: true, // Si se utilizan certificados autofirmados en el entorno de pruebas
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  build: {
    outDir: 'build',
  },
})