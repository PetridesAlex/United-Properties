import {resizePublicImage} from '../server/resizePublicImage.mjs'

export default async function handler(req, res) {
  try {
    const width = req.query?.w
    const quality = req.query?.q
    const target = typeof req.query?.url === 'string' ? req.query.url : ''
    const output = await resizePublicImage(target, width, quality)
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.status(200).send(output)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image failed'
    const status = /not allowed|Invalid image/.test(message) ? 400 : 502
    res.status(status).json({error: status === 400 ? message : 'Could not resize image'})
  }
}
