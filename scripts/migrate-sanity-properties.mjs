#!/usr/bin/env node
/**
 * One-off migration: legacy `property.status` → `purpose` + `listingStatus`,
 * optional `geometry` → top-level `latitude` / `longitude`,
 * plain-text `description` → `legacyDescriptionPlain` when `description` is still a string.
 *
 * Usage (from repo root, with a token that can mutate documents):
 *   SANITY_API_WRITE_TOKEN=... node scripts/migrate-sanity-properties.mjs
 *   SANITY_API_WRITE_TOKEN=... node scripts/migrate-sanity-properties.mjs --dry-run
 *
 * Defaults match ENTER/sanity.config.ts unless overridden:
 *   SANITY_PROJECT_ID=d7j11dpu SANITY_DATASET=production
 */

import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID || 'd7j11dpu'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN

const dryRun = process.argv.includes('--dry-run')

function normalizeStatus(raw) {
  if (typeof raw !== 'string') return ''
  return raw.trim().toLowerCase().replace(/\s+/g, '-')
}

function mapLegacyStatus(legacy) {
  const key = normalizeStatus(legacy)
  switch (key) {
    case 'for-sale':
      return {purpose: 'sale', listingStatus: 'available'}
    case 'for-rent':
      return {purpose: 'rent', listingStatus: 'available'}
    case 'sold':
      return {purpose: 'sale', listingStatus: 'sold'}
    case 'reserved':
      return {purpose: 'sale', listingStatus: 'reserved'}
    default:
      return null
  }
}

async function main() {
  if (!token) {
    console.error('Missing SANITY_API_WRITE_TOKEN (or SANITY_AUTH_TOKEN).')
    process.exit(1)
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  const docs = await client.fetch(
    `*[_type == "property"]{
      _id,
      status,
      purpose,
      listingStatus,
      description,
      legacyDescriptionPlain,
      geometry,
      latitude,
      longitude
    }`,
  )

  let patched = 0

  for (const doc of docs) {
    const mapped = mapLegacyStatus(doc.status)
    const sets = {}

    if (!doc.purpose && !doc.listingStatus && mapped) {
      sets.purpose = mapped.purpose
      sets.listingStatus = mapped.listingStatus
    }

    if (
      typeof doc.description === 'string' &&
      doc.description.trim() &&
      !doc.legacyDescriptionPlain
    ) {
      sets.legacyDescriptionPlain = doc.description.trim()
    }

    let chain = client.patch(doc._id)
    let hasMutation = false

    if (Object.keys(sets).length > 0) {
      chain = chain.set(sets)
      hasMutation = true
    }

    const geo =
      doc.geometry &&
      typeof doc.geometry.latitude === 'number' &&
      typeof doc.geometry.longitude === 'number'
    const needsGeo = geo && (doc.latitude == null || doc.longitude == null)

    if (needsGeo) {
      chain = chain.setIfMissing({
        latitude: doc.geometry.latitude,
        longitude: doc.geometry.longitude,
      })
      hasMutation = true
    }

    if (!hasMutation) continue

    if (dryRun) {
      console.log('[dry-run]', doc._id, {...sets, ...(needsGeo ? {latitude: doc.geometry.latitude, longitude: doc.geometry.longitude} : {})})
      patched += 1
      continue
    }

    await chain.commit()
    patched += 1
  }

  console.log(dryRun ? `[dry-run] ${patched} documents would change.` : `Committed patches on ${patched} documents.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
