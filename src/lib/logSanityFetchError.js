import { getSanityDataApiOrigin, SANITY_DATASET, SANITY_PROJECT_ID } from './sanityClient'

/**
 * Logs the full error to the console (always, including production) for debugging fetch/CORS/dataset issues.
 */
export function logSanityFetchError(phase, err, extra = {}) {
  const origin = getSanityDataApiOrigin()
  const payload = {
    phase,
    message: err?.message,
    name: err?.name,
    stack: err?.stack,
    cause: err?.cause,
    ...extra,
    sanity: {
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      dataApiOrigin: origin,
    },
  }
  console.error('[United Properties] Sanity fetch failed — see object below', payload)
  if (err?.cause) {
    console.error('[United Properties] Sanity fetch error.cause', err.cause)
  }
}
