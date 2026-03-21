import {defineField, defineType} from 'sanity'

export const developmentType = defineType({
  name: 'development',
  title: 'Development',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Off-Plan', value: 'off-plan'},
          {title: 'Under Construction', value: 'under-construction'},
          {title: 'Ready Soon', value: 'ready-soon'},
          {title: 'Completed', value: 'completed'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'deliveryDate',
      title: 'Delivery Date',
      type: 'date',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
    }),
  ],
})
