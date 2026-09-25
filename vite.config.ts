/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const THEME_COLOR = '#F4F4F1'

// https://vite.dev/config/
export default defineConfig({
  // Public path the app is served from. GitHub Pages project sites live
  // under /<repo>/, so CI sets BASE_PATH (e.g. `/easy-budget/`).
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        id: './',
        name: 'Easy Budget',
        short_name: 'Easy Budget',
        description:
          'Presupuesto mensual simple por categorías. Tus datos se guardan solo en tu dispositivo.',
        lang: 'es-MX',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        categories: ['finance', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
