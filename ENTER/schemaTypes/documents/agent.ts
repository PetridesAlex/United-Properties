import {defineField, defineType} from 'sanity'

export const agentType = defineType({
  name: 'agent',
  title: 'Agent',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      description: 'Full international number, no spaces (e.g. 35799123456).',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role / title',
      type: 'string',
      placeholder: 'e.g. Senior Sales Consultant',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'active',
      title: 'Active on website',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'notes',
      title: 'Internal notes',
      description: 'Not shown on the public website — Studio users only.',
      type: 'text',
      rows: 5,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo', email: 'email', phone: 'phone'},
    prepare({title, subtitle, media, email, phone}) {
      const contact = [email, phone].filter(Boolean).join(' · ')
      return {
        title: title || 'Agent',
        subtitle: [subtitle, contact].filter(Boolean).join(' — ') || undefined,
        media,
      }
    },
  },
})
