import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company name',
      type: 'string',
      initialValue: 'United Properties',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'companyEmail',
      title: 'Company email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'companyPhone',
      title: 'Company phone',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: false},
    }),
    defineField({
      name: 'footerText',
      title: 'Footer text',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'homepageHeroTitle',
      title: 'Homepage hero title',
      type: 'string',
    }),
    defineField({
      name: 'homepageHeroSubtitle',
      title: 'Homepage hero subtitle',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'homepageHeroImage',
      title: 'Homepage hero image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'seoDefaultTitle',
      title: 'Default SEO title',
      type: 'string',
    }),
    defineField({
      name: 'seoDefaultDescription',
      title: 'Default SEO description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site settings'}
    },
  },
})
