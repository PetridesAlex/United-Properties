import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const SANITY_PROJECT_ID = 'd7j11dpu'
export const SANITY_DATASET = 'production'
export const SANITY_API_VERSION = '2026-03-21'

/**
 * Public reads: only published documents are returned (drafts never appear on the site).
 * useCdn: Sanity’s API CDN caches responses; after you Publish in Studio, updates can lag
 * by ~1 minute. Default is off so fresh publishes show immediately. Set
 * VITE_SANITY_USE_CDN=true in .env for faster reads at the cost of slightly stale data.
 */
const useCdn =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SANITY_USE_CDN === 'true'

/**
 * In dev, point at Vite’s `/sanity-api` proxy (see vite.config.js) so requests are same-origin
 * and avoid browser "Failed to fetch" from CORS / mixed rules / extensions blocking cross-site APIs.
 */
function sanityApiHostForClient() {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return undefined
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/sanity-api`
  }
  return 'http://localhost:5173/sanity-api'
}

const devApiHost = sanityApiHostForClient()

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn,
  ...(devApiHost
    ? {
        useProjectHostname: false,
        apiHost: devApiHost,
      }
    : {}),
})

/** Base origin for `GET .../v{version}/data/query/{dataset}` (matches @sanity/client URL shape). */
export function getSanityDataApiOrigin() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/sanity-api`
    }
    return 'http://localhost:5173/sanity-api'
  }
  return `https://${SANITY_PROJECT_ID}.api.sanity.io`
}

const builder = imageUrlBuilder(sanityClient)

export function urlForImage(source) {
  if (!source) return null
  return builder.image(source)
}
