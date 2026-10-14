import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { cleanupOutdatedCaches: true, clientsClaim: true, skipWaiting: true, runtimeCaching: [], globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Huellita — Ficha QR para mascotas',
        short_name: 'Huellita',
        description: 'La ficha digital y el diario de bienestar de tu mascota.',
        theme_color: '#f8f7f2',
        // Icons use a centered paw mark with generous safe-area padding for mobile launchers.
        background_color: '#f8f7f2',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ]
});