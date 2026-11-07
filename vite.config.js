import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png', 'favicon.svg'],
      manifest: {
        name: 'Staffroom',
        short_name: 'Staffroom',
        description: 'Staffroom teacher dashboard',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/signin',
        id: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.staffroomng.com',
        changeOrigin: true,
        secure: true,
      },
      '/teachers': {
        target: 'https://api.staffroomng.com',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://api.staffroomng.com',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://api.staffroomng.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api.staffroomng.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
