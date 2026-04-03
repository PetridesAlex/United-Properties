import {defineField, defineType} from 'sanity'

export const propertyType = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
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
      title: 'Property Type',
      type: 'string',
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
      type: 'number',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'EUR',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
    }),
    defineField({
      name: 'internalArea',
      title: 'Internal Area',
      type: 'number',
    }),
    defineField({
      name: 'plotSize',
      title: 'Plot Size',
      type: 'number',
    }),
    defineField({
      name: 'parkingSpaces',
      title: 'Parking Spaces',
      type: 'number',
    }),
    defineField({
      name: 'yearBuilt',
      title: 'Year Built',
      type: 'number',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'newDevelopment',
      title: 'New development listing',
      description:
        'Show this property on the New Developments page (/new-developments). Use with status “For sale” for off-plan or newly launched units.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
    }),
  ],
})
