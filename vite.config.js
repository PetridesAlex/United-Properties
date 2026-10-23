import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// Listing photos are resized in dev by /api/image (see server/resizePublicImage.mjs).
function listingImageDevMiddleware() {
  return {
    name: 'listing-image-resize',
    configureServer(server) {
      server.middlewares.use('/api/image', async (req, res) => {
        try {
          const {resizePublicImage} = await import('./server/resizePublicImage.mjs')
          const requestUrl = new URL(req.url || '', 'http://localhost')
          const output = await resizePublicImage(
            requestUrl.searchParams.get('url') || '',
            requestUrl.searchParams.get('w'),
            requestUrl.searchParams.get('q'),
          )
          res.setHeader('Content-Type', 'image/jpeg')
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          res.end(output)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Image failed'
          const status = /not allowed|Invalid image/.test(message) ? 400 : 502
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({error: status === 400 ? message : 'Could not resize image'}))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), listingImageDevMiddleware()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
