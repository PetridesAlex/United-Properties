import {defineField, defineType} from 'sanity'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Client name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City or region shown with the quote.',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'text',
      title: 'Quote',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'rating', media: 'image'},
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Testimonial',
        subtitle: typeof subtitle === 'number' ? `${subtitle}★` : undefined,
        media,
      }
    },
  },
})
