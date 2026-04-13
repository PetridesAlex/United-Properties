import {defineArrayMember, defineField, defineType} from 'sanity'
import {GalleryImagesInput} from '../studio/GalleryImagesInput'

const WEBSITE = 'website'
const BAZARAKI = 'bazaraki'
const MEDIA_PHOTOS = 'mediaPhotos'
const MEDIA_DOCS = 'mediaDocs'
const SEO = 'seo'

export const propertyType = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    {name: WEBSITE, title: 'Website listing', default: true},
    {name: BAZARAKI, title: 'Bazaraki XML feed'},
    {name: MEDIA_PHOTOS, title: 'Photos & gallery'},
    {name: MEDIA_DOCS, title: 'Plans & downloads'},
    {name: SEO, title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: WEBSITE,
      description: 'Max 70 characters for Bazaraki. No price in the title; avoid duplicate words.',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: WEBSITE,
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Listing status (website)',
      type: 'string',
      group: WEBSITE,
      options: {
        list: [
          {title: 'Buy (for sale)', value: 'for-sale'},
          {title: 'Rent', value: 'for-rent'},
          {title: 'Sold', value: 'sold'},
          {title: 'Reserved', value: 'reserved'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Property type',
      type: 'string',
      group: WEBSITE,
      options: {
        list: [
          {title: 'Apartment', value: 'apartment'},
          {title: 'Villa', value: 'villa'},
          {title: 'House', value: 'house'},
          {title: 'Penthouse', value: 'penthouse'},
          {title: 'Land', value: 'land'},
          {title: 'Office', value: 'office'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      description: 'EUR — required for Bazaraki when “Include in Bazaraki feed” is on.',
      type: 'number',
      group: WEBSITE,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {publishToBazaraki?: boolean} | undefined
          if (doc?.publishToBazaraki && (value === undefined || value === null)) {
            return 'Price is required when the listing is included in the Bazaraki XML feed.'
          }
          return true
        }),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: WEBSITE,
      initialValue: 'EUR',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location (label)',
      type: 'string',
      group: WEBSITE,
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      group: WEBSITE,
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: WEBSITE,
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: WEBSITE,
    }),
    defineField({
      name: 'internalArea',
      title: 'Internal area (m²)',
      type: 'number',
      group: WEBSITE,
    }),
    defineField({
      name: 'plotSize',
      title: 'Plot size (m²)',
      type: 'number',
      group: WEBSITE,
    }),
    defineField({
      name: 'parkingSpaces',
      title: 'Parking spaces',
      type: 'number',
      group: WEBSITE,
    }),
    defineField({
      name: 'yearBuilt',
      title: 'Year built',
      type: 'number',
      group: WEBSITE,
    }),
    defineField({
      name: 'featured',
      title: 'Featured listing',
      description:
        'Turn on to show this property in “Featured listings” on the site and in the Featured desk view. Same document can also be Buy/Rent — this is an extra flag.',
      type: 'boolean',
      group: WEBSITE,
      initialValue: false,
    }),
    defineField({
      name: 'signature',
      title: 'Signature collection',
      description:
        'Turn on for Signature collection marketing. Use the desk view “Signature collection” to find these. Can combine with Buy and Featured.',
      type: 'boolean',
      group: WEBSITE,
      initialValue: false,
    }),
    defineField({
      name: 'newDevelopment',
      title: 'New development (property listing)',
      description:
        'Turn on for off-plan / new-build units shown with new-development listings. Separate from “Development projects” (which are full development documents). Usually used with Buy (for sale).',
      type: 'boolean',
      group: WEBSITE,
      initialValue: false,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: WEBSITE,
      rows: 8,
      description:
        'Plain text. Max 10 000 characters for Bazaraki. Export will escape XML entities (&, <, quotes).',
      validation: (rule) => rule.max(10000),
    }),

    defineField({
      name: 'publishToBazaraki',
      title: 'Include in Bazaraki XML feed',
      description:
        'When enabled, this document should be exported to the Bazaraki XML (stable external ID + rubric + district required).',
      type: 'boolean',
      group: BAZARAKI,
      initialValue: false,
    }),
    defineField({
      name: 'bazarakiExternalId',
      title: 'External ID (Bazaraki)',
      description:
        'Stable unique ID from your side. Never change it for the same listing — new IDs are treated as new ads. Required for feed.',
      type: 'string',
      group: BAZARAKI,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {publishToBazaraki?: boolean} | undefined
          if (doc?.publishToBazaraki && (!value || String(value).trim() === '')) {
            return 'Required when the listing is included in the Bazaraki feed.'
          }
          return true
        }),
    }),
    defineField({
      name: 'bazarakiListingStatus',
      title: 'Bazaraki status',
      description:
        'New ads: use Active (or Active B2B). Archive / Remove only after the ad already exists on Bazaraki.',
      type: 'string',
      group: BAZARAKI,
      initialValue: 'active',
      options: {
        list: [
          {title: 'Active — Bazaraki + agents (real estate)', value: 'active'},
          {title: 'Active B2B only — agents.bazaraki.com', value: 'active_b2b'},
          {title: 'Archive (existing ad only)', value: 'archive'},
          {title: 'Remove from Bazaraki (existing ad only)', value: 'remove'},
        ],
      },
    }),
    defineField({
      name: 'bazarakiRubric',
      title: 'Rubric (category ID)',
      description: 'One category ID per ad — see Bazaraki business XML guide.',
      type: 'number',
      group: BAZARAKI,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {publishToBazaraki?: boolean} | undefined
          if (doc?.publishToBazaraki && (value === undefined || value === null)) {
            return 'Rubric ID is required for the Bazaraki feed.'
          }
          return true
        }),
    }),
    defineField({
      name: 'bazarakiDistrict',
      title: 'District (location ID)',
      description: 'One location ID per ad — locations list in the business guide / API.',
      type: 'number',
      group: BAZARAKI,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {publishToBazaraki?: boolean} | undefined
          if (doc?.publishToBazaraki && (value === undefined || value === null)) {
            return 'District ID is required for the Bazaraki feed.'
          }
          return true
        }),
    }),
    defineField({
      name: 'lastUpdatedForFeed',
      title: 'Last update (feed)',
      description:
        'Optional. If set, XML export can use this for &lt;last_update&gt; so Bazaraki knows when to refresh fields and photos.',
      type: 'datetime',
      group: BAZARAKI,
    }),
    defineField({
      name: 'bazarakiAttrs',
      title: 'Bazaraki attributes',
      type: 'object',
      group: BAZARAKI,
      description:
        'Keys must match your rubric in the business guide (e.g. type, pool, parking, air-conditioning). Leave blank if unknown; export can fall back to bedrooms/bathrooms where applicable.',
      fields: [
        defineField({name: 'type', title: 'type', type: 'number'}),
        defineField({name: 'pool', title: 'pool', type: 'number'}),
        defineField({name: 'parking', title: 'parking', type: 'number'}),
        defineField({name: 'airConditioning', title: 'air-conditioning', type: 'number'}),
        defineField({
          name: 'numberOfBedrooms',
          title: 'number-of-bedrooms (override)',
          type: 'number',
        }),
        defineField({
          name: 'numberOfBathrooms',
          title: 'number-of-bathrooms (override)',
          type: 'number',
        }),
        defineField({name: 'postalcode', title: 'postalcode', type: 'string'}),
        defineField({
          name: 'mustHaves',
          title: 'must-haves',
          description: 'Comma-separated keys if multiple values are allowed.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'geometry',
      title: 'Map coordinates',
      type: 'object',
      group: BAZARAKI,
      fields: [
        defineField({name: 'latitude', title: 'Latitude', type: 'number'}),
        defineField({name: 'longitude', title: 'Longitude', type: 'number'}),
      ],
    }),
    defineField({
      name: 'phoneHide',
      title: 'Hide phone on Bazaraki',
      type: 'boolean',
      group: BAZARAKI,
      initialValue: false,
    }),
    defineField({
      name: 'negotiablePrice',
      title: 'Negotiable price (show label)',
      type: 'boolean',
      group: BAZARAKI,
      initialValue: false,
    }),
    defineField({
      name: 'exchange',
      title: 'Swap / exchange label',
      type: 'boolean',
      group: BAZARAKI,
      initialValue: false,
    }),
    defineField({
      name: 'disallowChat',
      title: 'Disallow chat',
      type: 'boolean',
      group: BAZARAKI,
      initialValue: false,
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp number',
      description: 'Shown on Bazaraki if supported for the category.',
      type: 'string',
      group: BAZARAKI,
    }),
    defineField({
      name: 'chosenPhone',
      title: 'Chosen / extra phone',
      description: 'Must be added in Bazaraki profile settings first.',
      type: 'string',
      group: BAZARAKI,
    }),
    defineField({
      name: 'itemLink',
      title: 'Link to this listing on your site',
      description:
        'For categories that support “Buy it” / external link. Real estate may ignore this — still useful for automation.',
      type: 'url',
      group: BAZARAKI,
    }),
    defineField({
      name: 'videoLink',
      title: 'YouTube video URL',
      type: 'url',
      group: BAZARAKI,
    }),
    defineField({
      name: 'videoUploadByUrl',
      title: 'Video file URL',
      description: 'Direct link to .mp4 / .mov etc. — not a YouTube page.',
      type: 'url',
      group: BAZARAKI,
    }),
    defineField({
      name: 'condition',
      title: 'Condition',
      type: 'number',
      group: BAZARAKI,
      options: {
        list: [
          {title: 'Used', value: 1},
          {title: 'New', value: 2},
        ],
      },
    }),
    defineField({
      name: 'delivery',
      title: 'Delivery option',
      description: 'Most real estate categories do not use this; set 0 if not applicable.',
      type: 'number',
      initialValue: 0,
      group: BAZARAKI,
    }),

    defineField({
      name: 'mainImage',
      title: 'Cover / hero image',
      type: 'image',
      group: MEDIA_PHOTOS,
      description:
        'Main photo for cards, hero, and SEO. Bulk-upload once via **Media** (left sidebar → grid icon), then **Select** here — no need to re-upload.',
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette']},
    }),
    defineField({
      name: 'galleryLeadImage',
      title: 'Featured gallery image (optional)',
      type: 'image',
      group: MEDIA_PHOTOS,
      description:
        'Optional. The image you want **first** in the on-site gallery (e.g. best interior shot). Pick the same file from **Media** as one of your gallery images, or any asset. If empty, the **first image in the gallery list** (below) is used.',
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette']},
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: MEDIA_PHOTOS,
      description:
        '**Bulk add:** use the blue **Choose multiple images** area above the grid (checkboxes, then **Insert N images**). You can also drag multiple files from your computer onto the grid, or use **Add item → Select** one at a time. **Reorder:** drag rows or tiles. Max 16 images when Bazaraki feed is enabled.',
      options: {
        layout: 'grid',
      },
      components: {input: GalleryImagesInput},
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
            metadata: ['blurhash', 'lqip', 'palette'],
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {publishToBazaraki?: boolean} | undefined
          const n = Array.isArray(value) ? value.length : 0
          if (doc?.publishToBazaraki && n > 16) {
            return 'Bazaraki allows at most 16 images per ad.'
          }
          return true
        }),
    }),
    defineField({
      name: 'floorPlanImage',
      title: 'Floor plan',
      type: 'image',
      group: MEDIA_DOCS,
      description:
        'Optional. Plan drawing or screenshot (PNG/JPEG). Choose an existing upload from **Media** or add a new file — it stays in the library for reuse.',
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette']},
    }),
    defineField({
      name: 'brochureFile',
      title: 'Brochure or PDF',
      type: 'file',
      group: MEDIA_DOCS,
      description:
        'Optional. PDF brochure for visitors to download. Upload once; the file is stored in Sanity and can be linked from other listings too via **Select**.',
      options: {
        accept: 'application/pdf,.pdf',
      },
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      group: WEBSITE,
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: SEO,
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      group: SEO,
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      media: 'mainImage',
      bazaraki: 'publishToBazaraki',
    },
    prepare({title, status, media, bazaraki}) {
      const sub = [status, bazaraki ? 'Bazaraki feed' : null].filter(Boolean).join(' · ')
      return {
        title: title || 'Property',
        subtitle: sub || undefined,
        media,
      }
    },
  },
})
