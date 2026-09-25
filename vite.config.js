import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'My PWA App',
        short_name: 'App',
        description: 'An offline capable React application',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    }),
    {
      name: 'local-api-mock',
      configureServer(server) {
        server.middlewares.use('/api/verify-captcha', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, score: 1.0, note: 'Local dev bypass' }));
        });
      },
    },
  ],
});
