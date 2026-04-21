import {defineArrayMember, defineField, defineType} from 'sanity'
import {INQUIRY_STATUSES} from '../../lib/constants'

export const inquiryType = defineType({
  name: 'inquiry',
  title: 'Inquiry / Lead',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
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
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'property',
      title: 'Related property',
      type: 'reference',
      to: [{type: 'property'}],
      description: 'Leave empty for general enquiries.',
    }),
    defineField({
      name: 'inquiryType',
      title: 'Inquiry type',
      type: 'string',
      options: {
        list: [
          {title: 'Sale', value: 'sale'},
          {title: 'Rent', value: 'rent'},
          {title: 'General', value: 'general'},
        ],
        layout: 'radio',
      },
      initialValue: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Pipeline status',
      type: 'string',
      options: {
        list: [...INQUIRY_STATUSES],
        layout: 'radio',
      },
      initialValue: 'new',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: 'Low', value: 'low'},
          {title: 'Medium', value: 'medium'},
          {title: 'High', value: 'high'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'assignedAgent',
      title: 'Assigned agent',
      type: 'reference',
      to: [{type: 'agent'}],
    }),
    defineField({
      name: 'source',
      title: 'Lead source',
      type: 'string',
      options: {
        list: [
          {title: 'Website form', value: 'website_form'},
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Phone call', value: 'phone_call'},
          {title: 'Email', value: 'email'},
          {title: 'Other', value: 'other'},
        ],
      },
      initialValue: 'website_form',
    }),
    defineField({
      name: 'notes',
      title: 'Internal notes',
      type: 'array',
      of: [defineArrayMember({type: 'inquiryNote'})],
      description: 'Timestamped notes — not shown on the public site.',
    }),
    defineField({
      name: 'followUpDate',
      title: 'Follow-up date',
      type: 'date',
      description: 'When to contact this lead again.',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'lastContactedAt',
      title: 'Last contacted',
      type: 'datetime',
      description: 'Update when you speak with the client.',
    }),
  ],
  preview: {
    select: {
      title: 'fullName',
      status: 'status',
      priority: 'priority',
      propertyTitle: 'property.title',
      agentName: 'assignedAgent.name',
      followUp: 'followUpDate',
    },
    prepare({title, status, priority, propertyTitle, agentName, followUp}) {
      const bits = [status, priority, propertyTitle, agentName, followUp ? `FU: ${followUp}` : '']
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Lead',
        subtitle: bits || undefined,
      }
    },
  },
  orderings: [
    {
      title: 'Newest',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
    {
      title: 'Follow-up date',
      name: 'followUpAsc',
      by: [{field: 'followUpDate', direction: 'asc'}],
    },
  ],
})
