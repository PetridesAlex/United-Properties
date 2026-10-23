import {createHash} from 'node:crypto'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {tmpdir} from 'node:os'
import sharp from 'sharp'

const CACHE_DIR = path.join(tmpdir(), 'up-image-cache')

/**
 * Resize a public Supabase Storage image.
 * Image transforms are not enabled on this project, so full originals are several MB.
 * @param {string} targetUrl
 * @param {number} width
 * @param {number} quality
 * @returns {Promise<Buffer>}
 */
export async function resizePublicImage(targetUrl, width, quality) {
  const safeWidth = clamp(width, 64, 2000, 960)
  const safeQuality = clamp(quality, 40, 86, 72)
  assertPublicStorageUrl(targetUrl)

  const key = createHash('sha1').update(`${targetUrl}|${safeWidth}|${safeQuality}`).digest('hex')
  const cached = path.join(CACHE_DIR, `${key}.jpg`)
  if (existsSync(cached)) return readFileSync(cached)

  const upstream = await fetch(targetUrl)
  if (!upstream.ok) {
    throw new Error(`Image upstream ${upstream.status}`)
  }
  const input = Buffer.from(await upstream.arrayBuffer())
  const output = await sharp(input, {failOn: 'none', limitInputPixels: 80_000_000})
    .rotate()
    .resize({width: safeWidth, withoutEnlargement: true, fit: 'inside'})
    .jpeg({quality: safeQuality, mozjpeg: true})
    .toBuffer()

  mkdirSync(CACHE_DIR, {recursive: true})
  writeFileSync(cached, output)
  return output
}

export function assertPublicStorageUrl(targetUrl) {
  let parsed
  try {
    parsed = new URL(targetUrl)
  } catch {
    throw new Error('Invalid image url')
  }
  const hostOk = parsed.hostname.endsWith('.supabase.co')
  const pathOk = parsed.pathname.startsWith('/storage/v1/object/public/')
  if (parsed.protocol !== 'https:' || !hostOk || !pathOk) {
    throw new Error('Image host is not allowed')
  }
}

function clamp(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}
