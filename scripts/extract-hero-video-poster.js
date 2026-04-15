/**
 * Extracts a JPEG poster frame from the hero MP4 for VideoObject thumbnailUrl / og:image.
 * Requires devDependency `ffmpeg-static`. Run: npm run extract:video-poster
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const videoPath = path.join(root, 'public/video/hero-video-optimize-united-properties.mp4')
const outPath = path.join(root, 'public/images/video/hero-luxury-real-estate-cyprus-poster.jpg')

if (!fs.existsSync(videoPath)) {
  console.error('[poster] Missing video:', videoPath)
  process.exit(1)
}

if (!ffmpegPath) {
  console.warn('[poster] ffmpeg-static path unavailable; skipping.')
  process.exit(0)
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })

execFileSync(
  ffmpegPath,
  [
    '-y',
    '-ss',
    '00:00:01',
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-vf',
    'scale=1280:-2',
    '-q:v',
    '2',
    outPath,
  ],
  { stdio: 'inherit' },
)

console.log('[poster] Wrote', outPath)
