import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const SANITY_PROJECT_ID = 'd7j11dpu'
export const SANITY_DATASET = 'production'
export const SANITY_API_VERSION = '2026-03-21'

/**
 * Public reads: only published documents are returned (drafts never appear on the site).
 * Debugging: always use Content Lake API (not api.cdn.sanity.io). Restore env toggle after verifying:
 * `const useCdn = import.meta.env?.VITE_SANITY_USE_CDN === 'true'`
 */
const useCdn = false

/**
 * Same-origin `/sanity-api` in the browser (dev: vite.config.js proxy; production: vercel.json rewrite).
 * Avoids cross-origin "Failed to fetch" to *.api.sanity.io on live sites.
 * Falls back to direct API when `window` is missing (e.g. tooling).
 */
function sanityProxyHostForBrowser() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/sanity-api`
  }
  return null
}

const browserSanityProxy = sanityProxyHostForBrowser()

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn,
  ...(browserSanityProxy
    ? {
        useProjectHostname: false,
        apiHost: browserSanityProxy,
      }
    : {}),
})

/** Base URL for `GET .../v{version}/data/query/{dataset}` (matches @sanity/client URL shape). */
export function getSanityDataApiOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/sanity-api`
  }
  return `https://${SANITY_PROJECT_ID}.api.sanity.io`
}

const builder = imageUrlBuilder(sanityClient)

export function urlForImage(source) {
  if (!source) return null
  return builder.image(source)
}
