import {defineArrayMember, defineField, defineType} from 'sanity'

const WEBSITE = 'website'
const BAZARAKI = 'bazaraki'
const MEDIA = 'media'
const SEO = 'seo'

export const propertyType = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    {name: WEBSITE, title: 'Website listing', default: true},
    {name: BAZARAKI, title: 'Bazaraki XML feed'},
    {name: MEDIA, title: 'Media'},
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
          {title: 'For Sale', value: 'for-sale'},
          {title: 'For Rent', value: 'for-rent'},
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
      title: 'Featured',
      type: 'boolean',
      group: WEBSITE,
      initialValue: false,
    }),
    defineField({
      name: 'signature',
      title: 'Signature listing',
      description: 'Used for Signature collection / marketing on the website.',
      type: 'boolean',
      group: WEBSITE,
      initialValue: false,
    }),
    defineField({
      name: 'newDevelopment',
      title: 'New development listing',
      description:
        'Show on New Developments (/new-developments). Often used with “For sale” for off-plan units.',
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
      title: 'Main image',
      type: 'image',
      group: MEDIA,
      description:
        'One image per slot. To pick from the Media library (batch uploads live there), use “Select” and choose multiple assets where supported.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: MEDIA,
      description:
        '**Quick add many photos:** (1) Drag several files from your computer onto this gallery area — Studio adds one image per file. (2) Or open **Media** in the left toolbar, upload a batch there, then here use **Browse** / asset picker and select multiple. The small “Choose file” control on a single slot only uploads **one** file at a time (Sanity default). Max 16 images if the listing is on the Bazaraki feed.',
      options: {
        layout: 'grid',
      },
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
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
