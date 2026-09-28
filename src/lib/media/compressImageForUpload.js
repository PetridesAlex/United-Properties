const MAX_EDGE = 2400
const JPEG_QUALITY = 0.82

/**
 * Downscale huge camera uploads before storage so listing previews stay snappy.
 * Returns the original file when compression is unnecessary or unsupported.
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImageForUpload(file) {
  if (!file || typeof file.type !== 'string' || !file.type.startsWith('image/')) {
    return file
  }
  // Keep animated GIFs / SVG as-is.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file
  // Already modest files rarely need another pass.
  if (file.size > 0 && file.size < 450_000) return file

  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    return compressWithHtmlCanvas(file)
  }

  try {
    const bitmap = await createImageBitmap(file)
    const {width, height} = fitWithin(bitmap.width, bitmap.height, MAX_EDGE)
    if (width >= bitmap.width && height >= bitmap.height && file.size < 1_600_000) {
      bitmap.close?.()
      return file
    }

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close?.()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const preferWebp = file.type === 'image/webp'
    const mime = preferWebp ? 'image/webp' : 'image/jpeg'
    const blob = await canvas.convertToBlob({type: mime, quality: JPEG_QUALITY})
    if (!blob || blob.size <= 0 || blob.size >= file.size * 0.98) return file

    const base = file.name.replace(/\.[^.]+$/, '') || 'property'
    const ext = preferWebp ? 'webp' : 'jpg'
    return new File([blob], `${base}.${ext}`, {type: mime, lastModified: Date.now()})
  } catch {
    return compressWithHtmlCanvas(file)
  }
}

/**
 * @param {File} file
 * @returns {Promise<File>}
 */
function compressWithHtmlCanvas(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const {width, height} = fitWithin(image.naturalWidth, image.naturalHeight, MAX_EDGE)
        if (width >= image.naturalWidth && height >= image.naturalHeight && file.size < 1_600_000) {
          resolve(file)
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(image, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size <= 0 || blob.size >= file.size * 0.98) {
              resolve(file)
              return
            }
            const base = file.name.replace(/\.[^.]+$/, '') || 'property'
            resolve(new File([blob], `${base}.jpg`, {type: 'image/jpeg', lastModified: Date.now()}))
          },
          'image/jpeg',
          JPEG_QUALITY,
        )
      } catch {
        resolve(file)
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    image.src = url
  })
}

/**
 * @param {number} width
 * @param {number} height
 * @param {number} maxEdge
 */
function fitWithin(width, height, maxEdge) {
  const w = Math.max(1, width || 1)
  const h = Math.max(1, height || 1)
  const longest = Math.max(w, h)
  if (longest <= maxEdge) return {width: w, height: h}
  const scale = maxEdge / longest
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  }
}
