import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './sanity.structure'

export default defineConfig({
  name: 'default',
  title: 'United Properties',

  projectId: 'd7j11dpu',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'property-for-sale',
        title: 'Property: For Sale',
        schemaType: 'property',
        value: {status: 'for-sale', featured: false, currency: 'EUR'},
      },
      {
        id: 'property-for-rent',
        title: 'Property: For Rent',
        schemaType: 'property',
        value: {status: 'for-rent', featured: false, currency: 'EUR'},
      },
      {
        id: 'property-featured',
        title: 'Property: Featured',
        schemaType: 'property',
        value: {status: 'for-sale', featured: true, currency: 'EUR'},
      },
      {
        id: 'development-new',
        title: 'Development: New',
        schemaType: 'development',
        value: {status: 'off-plan', featured: false},
      },
    ],
  },
})
