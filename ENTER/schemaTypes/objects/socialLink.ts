import {defineField, defineType} from 'sanity'

export const socialLinkType = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          {title: 'Instagram', value: 'instagram'},
          {title: 'Facebook', value: 'facebook'},
          {title: 'LinkedIn', value: 'linkedin'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'X / Twitter', value: 'twitter'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {platform: 'platform', url: 'url'},
    prepare({platform, url}) {
      return {title: platform || 'Social', subtitle: url}
    },
  },
})
