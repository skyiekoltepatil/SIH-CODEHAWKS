import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-mock',
      configureServer(server) {
        server.middlewares.use('/api/verify-captcha', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, score: 1.0, note: 'Local dev bypass' }));
        });
      }
    }
  ],
})
