import {defineField, defineType} from 'sanity'

export const inquiryNoteType = defineType({
  name: 'inquiryNote',
  title: 'Internal note',
  type: 'object',
  fields: [
    defineField({
      name: 'body',
      title: 'Note',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'When',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorLabel',
      title: 'Author (optional)',
      type: 'string',
      description: 'Who added this note — initials or name.',
      placeholder: 'e.g. Maria K.',
    }),
  ],
  preview: {
    select: {body: 'body', createdAt: 'createdAt', authorLabel: 'authorLabel'},
    prepare({body, createdAt, authorLabel}) {
      const stamp = createdAt ? new Date(createdAt).toLocaleString() : ''
      const short = typeof body === 'string' ? body.slice(0, 80) + (body.length > 80 ? '…' : '') : ''
      return {
        title: authorLabel ? `${authorLabel} — ${stamp}` : stamp || 'Note',
        subtitle: short,
      }
    },
  },
})
