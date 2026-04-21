import {defineField, defineType} from 'sanity'

export const mediaCleanupHelpType = defineType({
  name: 'mediaCleanupHelp',
  title: 'Media cleanup help',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'How to delete image assets safely',
      readOnly: true,
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'text',
      rows: 10,
      readOnly: true,
      initialValue:
        '1) Open Media and pick one asset that fails to delete.\n2) Copy its asset ID.\n3) Open Vision and run the query below with that ID.\n4) Remove the image from every referenced document (main image, gallery, floor plan, etc).\n5) Publish those documents.\n6) Return to Media and delete the asset again.',
    }),
    defineField({
      name: 'queryByAssetId',
      title: 'Vision query: where this asset is used',
      type: 'text',
      rows: 8,
      readOnly: true,
      initialValue:
        '*[_type == "property" && references($assetId)]{\n  _id,\n  _type,\n  title,\n  "slug": slug.current\n}',
    }),
    defineField({
      name: 'queryParams',
      title: 'Vision params example',
      type: 'text',
      rows: 3,
      readOnly: true,
      initialValue: '{\n  "assetId": "image-xxxx-xxxx-xxxx-xxxx"\n}',
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
