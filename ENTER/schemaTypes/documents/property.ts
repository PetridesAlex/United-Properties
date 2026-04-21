import {defineArrayMember, defineField, defineType} from 'sanity'
import {GalleryImageMemberInput} from '../../studio/GalleryImageMemberInput'
import {PropertyGalleryInput} from '../../studio/PropertyGalleryInput'

const BASIC = 'basicInfo'
const DETAILS = 'propertyDetails'
const MEDIA_PHOTOS = 'media'
const MEDIA_DOCS = 'mediaDocs'
const LOCATION = 'location'
const SEO = 'seo'
const LEGACY = 'legacy'

export const propertyType = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    {name: BASIC, title: 'Basic info', default: true},
    {name: DETAILS, title: 'Property details'},
    {name: MEDIA_PHOTOS, title: 'Media'},
    {name: MEDIA_DOCS, title: 'Plans & downloads'},
    {name: LOCATION, title: 'Location'},
    {name: SEO, title: 'SEO'},
    {name: LEGACY, title: 'Legacy (hidden)', hidden: true},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: BASIC,
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: BASIC,
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'referenceId',
      title: 'Reference ID',
      description: 'Unique listing code (e.g. UP-1042). Shown internally and on factsheets.',
      type: 'string',
      group: BASIC,
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          const v = typeof value === 'string' ? value.trim() : ''
          if (!v) return 'Required'
          const client = context.getClient({apiVersion: '2024-01-01'})
          const rawId = context.document?._id
          if (!rawId) return true
          const alt = rawId.startsWith('drafts.') ? rawId.slice(7) : `drafts.${rawId}`
          const dup = await client.fetch(
            `count(*[_type == "property" && referenceId == $ref && !(_id in [$a, $b])])`,
            {ref: v, a: rawId, b: alt},
          )
          return dup === 0 ? true : 'Reference ID already in use'
        }),
    }),
    defineField({
      name: 'purpose',
      title: 'Purpose',
      description: 'Buy (sale) or rent.',
      type: 'string',
      group: BASIC,
      options: {
        list: [
          {title: 'Sale', value: 'sale'},
          {title: 'Rent', value: 'rent'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'listingStatus',
      title: 'Listing status',
      type: 'string',
      group: BASIC,
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Sold', value: 'sold'},
          {title: 'Rented', value: 'rented'},
          {title: 'Reserved', value: 'reserved'},
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      group: BASIC,
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: BASIC,
      initialValue: 'EUR',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
      group: BASIC,
      weak: true,
    }),
    defineField({
      name: 'area',
      title: 'Area / neighbourhood',
      description: 'District or community within the city.',
      type: 'string',
      group: BASIC,
    }),
    defineField({
      name: 'location',
      title: 'Location label (override)',
      description: 'Optional short label for cards if different from city + area.',
      type: 'string',
      group: BASIC,
    }),
    defineField({
      name: 'propertyType',
      title: 'Property type',
      type: 'string',
      group: DETAILS,
      options: {
        list: [
          {title: 'Apartment', value: 'apartment'},
          {title: 'Villa', value: 'villa'},
          {title: 'House', value: 'house'},
          {title: 'Penthouse', value: 'penthouse'},
          {title: 'Land', value: 'land'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Office', value: 'office'},
          {title: 'Shop', value: 'shop'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'internalArea',
      title: 'Internal area (m²)',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'coveredVeranda',
      title: 'Covered veranda (m²)',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'uncoveredVeranda',
      title: 'Uncovered veranda (m²)',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'plotSize',
      title: 'Plot size (m²)',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'parkingSpaces',
      title: 'Parking spaces',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'yearBuilt',
      title: 'Year built',
      type: 'number',
      group: DETAILS,
    }),
    defineField({
      name: 'furnished',
      title: 'Furnished',
      type: 'boolean',
      initialValue: false,
      group: DETAILS,
    }),
    defineField({
      name: 'featured',
      title: 'Featured listing',
      type: 'boolean',
      group: BASIC,
      initialValue: false,
    }),
    defineField({
      name: 'signature',
      title: 'Signature collection',
      type: 'boolean',
      group: BASIC,
      initialValue: false,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      group: BASIC,
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading', value: 'h3'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        }),
      ],
      description: 'Main marketing copy for the listing.',
    }),
    defineField({
      name: 'legacyDescriptionPlain',
      title: 'Legacy plain description',
      description: 'Migrated from old text field — copy into Description blocks then clear.',
      type: 'text',
      group: LEGACY,
      rows: 6,
      hidden: ({document}) => !document?.legacyDescriptionPlain,
    }),
    defineField({
      name: 'agent',
      title: 'Listing agent',
      type: 'reference',
      to: [{type: 'agent'}],
      group: BASIC,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: BASIC,
    }),
    defineField({
      name: 'mainImage',
      title: 'Cover / hero image',
      type: 'image',
      group: MEDIA_PHOTOS,
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette']},
    }),
    defineField({
      name: 'galleryLeadImage',
      title: 'Featured gallery image (optional)',
      type: 'image',
      group: MEDIA_PHOTOS,
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette']},
    }),
    defineField({
      name: 'gallery',
      title: 'Property gallery',
      type: 'array',
      group: MEDIA_PHOTOS,
      description:
        'Use the upload box to add multiple photos together, or select from Media library.',
      components: {input: PropertyGalleryInput},
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          components: {
            input: GalleryImageMemberInput,
          },
          options: {
            hotspot: true,
            metadata: ['blurhash', 'lqip', 'palette'],
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Short description for accessibility and SEO.',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'floorPlanImage',
      title: 'Floor plan',
      type: 'image',
      group: MEDIA_DOCS,
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette']},
    }),
    defineField({
      name: 'brochureFile',
      title: 'Brochure or PDF',
      type: 'file',
      group: MEDIA_DOCS,
      options: {
        accept: 'application/pdf,.pdf',
      },
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      group: DETAILS,
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      group: LOCATION,
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      group: LOCATION,
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      group: LOCATION,
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

    /* --- Legacy fields — keep until documents are cleaned up --- */
    defineField({
      name: 'status',
      title: 'Legacy: old listing status (pre-migration)',
      type: 'string',
      group: LEGACY,
      hidden: ({document}) => !document?.status,
      readOnly: true,
    }),
    defineField({
      name: 'newDevelopment',
      title: 'Legacy: new development flag',
      type: 'boolean',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'publishToBazaraki',
      title: 'Legacy: publishToBazaraki',
      type: 'boolean',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'bazarakiExternalId',
      title: 'Legacy: bazarakiExternalId',
      type: 'string',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'bazarakiListingStatus',
      title: 'Legacy: bazarakiListingStatus',
      type: 'string',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'bazarakiRubric',
      title: 'Legacy: bazarakiRubric',
      type: 'number',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'bazarakiDistrict',
      title: 'Legacy: bazarakiDistrict',
      type: 'number',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'lastUpdatedForFeed',
      title: 'Legacy: lastUpdatedForFeed',
      type: 'datetime',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'bazarakiAttrs',
      title: 'Legacy: bazarakiAttrs',
      type: 'object',
      group: LEGACY,
      hidden: true,
      readOnly: true,
      fields: [
        defineField({name: 'type', type: 'number'}),
        defineField({name: 'pool', type: 'number'}),
        defineField({name: 'parking', type: 'number'}),
        defineField({name: 'airConditioning', type: 'number'}),
        defineField({name: 'numberOfBedrooms', type: 'number'}),
        defineField({name: 'numberOfBathrooms', type: 'number'}),
        defineField({name: 'postalcode', type: 'string'}),
        defineField({name: 'mustHaves', type: 'string'}),
      ],
    }),
    defineField({
      name: 'geometry',
      title: 'Legacy: geometry',
      type: 'object',
      group: LEGACY,
      hidden: ({document}) => !document?.geometry,
      readOnly: true,
      fields: [
        defineField({name: 'latitude', type: 'number'}),
        defineField({name: 'longitude', type: 'number'}),
      ],
    }),
    defineField({
      name: 'phoneHide',
      title: 'Legacy: phoneHide',
      type: 'boolean',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'negotiablePrice',
      title: 'Legacy: negotiablePrice',
      type: 'boolean',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'exchange',
      title: 'Legacy: exchange',
      type: 'boolean',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'disallowChat',
      title: 'Legacy: disallowChat',
      type: 'boolean',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'whatsapp',
      title: 'Legacy: whatsapp',
      type: 'string',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'chosenPhone',
      title: 'Legacy: chosenPhone',
      type: 'string',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'itemLink',
      title: 'Legacy: itemLink',
      type: 'url',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'videoLink',
      title: 'Legacy: videoLink',
      type: 'url',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'videoUploadByUrl',
      title: 'Legacy: videoUploadByUrl',
      type: 'url',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'condition',
      title: 'Legacy: condition',
      type: 'number',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'delivery',
      title: 'Legacy: delivery',
      type: 'number',
      group: LEGACY,
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      purpose: 'purpose',
      listingStatus: 'listingStatus',
      price: 'price',
      currency: 'currency',
      cityName: 'city.name',
      media: 'mainImage',
      refId: 'referenceId',
    },
    prepare({title, purpose, listingStatus, price, currency, cityName, media, refId}) {
      const bits = [
        refId,
        typeof price === 'number' ? `${price.toLocaleString()} ${currency || 'EUR'}` : null,
        cityName,
        purpose === 'sale' ? 'Sale' : purpose === 'rent' ? 'Rent' : purpose,
        listingStatus,
      ]
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Property',
        subtitle: bits || undefined,
        media,
      }
    },
  },
})
