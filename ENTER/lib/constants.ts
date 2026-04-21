/** Inquiry pipeline — matches `inquiry` document `status` field values */
export const INQUIRY_STATUSES = [
  {title: 'New', value: 'new'},
  {title: 'Contacted', value: 'contacted'},
  {title: 'Follow-up', value: 'follow_up'},
  {title: 'Viewing scheduled', value: 'viewing_scheduled'},
  {title: 'Negotiation', value: 'negotiation'},
  {title: 'Closed', value: 'closed'},
  {title: 'Lost', value: 'lost'},
] as const

export type InquiryStatusValue = (typeof INQUIRY_STATUSES)[number]['value']

export const INQUIRY_STATUS_ORDER: InquiryStatusValue[] = [
  'new',
  'contacted',
  'follow_up',
  'viewing_scheduled',
  'negotiation',
  'closed',
  'lost',
]
