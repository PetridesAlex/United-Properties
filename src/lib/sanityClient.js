import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'd7j11dpu',
  dataset: 'production',
  apiVersion: '2026-03-21',
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)

export function urlForImage(source) {
  if (!source) return null
  return builder.image(source)
}
