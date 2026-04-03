import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Must match src/lib/sanityClient.js — dev proxy target for Sanity Content Lake API */
const SANITY_PROJECT_API_HOST = 'https://d7j11dpu.api.sanity.io'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin in dev so the browser + @sanity/client avoid cross-origin "Failed to fetch"
      '/sanity-api': {
        target: SANITY_PROJECT_API_HOST,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/sanity-api/, ''),
      },
    },
  },
})
