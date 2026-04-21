import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {structure} from './deskStructure'
import {unitedPropertiesTools} from './plugins/unitedPropertiesTools'

/**
 * Put Media library first when picking images (reuse uploads). Property **gallery** uses a custom
 * input (`studio/PropertyGalleryInput.tsx`): multi-file picker, drop zone, media batch-add, reorder, alt text.
 */
function imageAssetSourcesWithMediaFirst<T extends {name: string}>(prev: T[]): T[] {
  const mediaSource = prev.find((s) => s.name === 'media')
  const rest = prev.filter((s) => s.name !== 'media')
  return mediaSource ? [mediaSource, ...rest] : prev
}

const mediaPluginOptions = {
  creditLine: {enabled: false},
  directUploads: true,
  /** ~25 MB per file; adjust if your project needs larger PDFs/images */
  maximumUploadSize: 25000000,
}

export default defineConfig({
  name: 'default',
  title: 'United Properties',

  projectId: 'd7j11dpu',
  dataset: 'production',

  plugins: [
    unitedPropertiesTools(),
    media(mediaPluginOptions),
    structureTool({structure}),
    visionTool(),
  ],

  form: {
    image: {
      assetSources: imageAssetSourcesWithMediaFirst,
    },
  },

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'property-for-sale',
        title: 'Property: Buy (for sale)',
        schemaType: 'property',
        value: {
          purpose: 'sale',
          listingStatus: 'available',
          featured: false,
          currency: 'EUR',
        },
      },
      {
        id: 'property-for-rent',
        title: 'Property: Rent',
        schemaType: 'property',
        value: {
          purpose: 'rent',
          listingStatus: 'available',
          featured: false,
          currency: 'EUR',
        },
      },
      {
        id: 'property-featured',
        title: 'Property: Featured listing',
        schemaType: 'property',
        value: {
          purpose: 'sale',
          listingStatus: 'available',
          featured: true,
          currency: 'EUR',
        },
      },
      {
        id: 'property-signature',
        title: 'Property: Signature collection',
        schemaType: 'property',
        value: {
          purpose: 'sale',
          listingStatus: 'available',
          featured: false,
          signature: true,
          currency: 'EUR',
        },
      },
    ],
  },
})
