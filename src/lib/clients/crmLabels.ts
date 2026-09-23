import type {
  ClientActivityAction,
  ClientFollowUpStatus,
  ClientFollowUpType,
  ClientProcessStage,
  ClientPropertyInterestStatus,
  ClientType,
} from '../../types/cms'

export const CLIENT_PROCESS_STAGES: ClientProcessStage[] = [
  'new_lead',
  'contacted',
  'properties_suggested',
  'interested',
  'viewing_scheduled',
  'viewing_completed',
  'negotiation',
  'offer_made',
  'deal_in_progress',
  'completed',
  'lost_inactive',
]

export const CLIENT_PROCESS_STAGE_LABELS: Record<ClientProcessStage, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  properties_suggested: 'Properties Suggested',
  interested: 'Interested',
  viewing_scheduled: 'Viewing Scheduled',
  viewing_completed: 'Viewing Completed',
  negotiation: 'Negotiation',
  offer_made: 'Offer Made',
  deal_in_progress: 'Deal in Progress',
  completed: 'Completed',
  lost_inactive: 'Lost / Inactive',
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  tenant: 'Tenant',
  investor: 'Investor',
  other: 'Other',
}

export const CLIENT_PROPERTY_INTEREST_STATUSES: ClientPropertyInterestStatus[] = [
  'suggested',
  'sent_to_client',
  'interested',
  'viewing_requested',
  'viewing_scheduled',
  'viewed',
  'offer_made',
  'negotiation',
  'not_interested',
  'completed',
]

export const CLIENT_PROPERTY_INTEREST_LABELS: Record<ClientPropertyInterestStatus, string> = {
  suggested: 'Suggested',
  sent_to_client: 'Sent to Client',
  interested: 'Interested',
  viewing_requested: 'Viewing Requested',
  viewing_scheduled: 'Viewing Scheduled',
  viewed: 'Viewed',
  offer_made: 'Offer Made',
  negotiation: 'Negotiation',
  not_interested: 'Not Interested',
  completed: 'Completed',
}

export const CLIENT_FOLLOW_UP_TYPES: ClientFollowUpType[] = [
  'follow_up',
  'phone_call',
  'meeting',
  'viewing',
  'contract',
  'payment',
  'deposit',
  'reminder',
  'other',
]

export const CLIENT_FOLLOW_UP_TYPE_LABELS: Record<ClientFollowUpType, string> = {
  follow_up: 'Follow-up',
  phone_call: 'Phone Call',
  meeting: 'Meeting',
  viewing: 'Viewing',
  contract: 'Contract',
  payment: 'Payment',
  deposit: 'Deposit',
  reminder: 'Reminder',
  other: 'Other',
}

export const CLIENT_FOLLOW_UP_STATUS_LABELS: Record<ClientFollowUpStatus, string> = {
  upcoming: 'Upcoming',
  today: 'Today',
  completed: 'Completed',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
}

export const CLIENT_ACTIVITY_ACTION_LABELS: Record<string, string> = {
  client_created: 'Client created',
  client_updated: 'Client edited',
  client_archived: 'Client archived',
  client_restored: 'Client restored',
  stage_changed: 'Stage changed',
  property_linked: 'Property linked',
  property_unlinked: 'Property removed',
  property_status_changed: 'Property status changed',
  note_added: 'Note added',
  follow_up_created: 'Follow-up created',
  follow_up_completed: 'Follow-up completed',
  follow_up_cancelled: 'Follow-up cancelled',
  viewing_scheduled: 'Viewing scheduled',
  viewing_completed: 'Viewing completed',
  client_contacted: 'Client contacted',
  offer_recorded: 'Offer recorded',
  deal_completed: 'Deal completed',
}

export function stageLabel(stage: string | null | undefined): string {
  if (!stage) return CLIENT_PROCESS_STAGE_LABELS.new_lead
  return CLIENT_PROCESS_STAGE_LABELS[stage as ClientProcessStage] ?? stage
}

export function interestLabel(status: string | null | undefined): string {
  if (!status) return CLIENT_PROPERTY_INTEREST_LABELS.suggested
  return CLIENT_PROPERTY_INTEREST_LABELS[status as ClientPropertyInterestStatus] ?? status
}

export function followUpTypeLabel(type: string | null | undefined): string {
  if (!type) return CLIENT_FOLLOW_UP_TYPE_LABELS.follow_up
  return CLIENT_FOLLOW_UP_TYPE_LABELS[type as ClientFollowUpType] ?? type
}

export function resolveFollowUpStatus(
  startsAt: string,
  status: string,
): ClientFollowUpStatus {
  if (status === 'completed' || status === 'cancelled') {
    return status
  }
  const start = new Date(startsAt)
  const now = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (startDay.getTime() === today.getTime()) return 'today'
  if (start.getTime() < now.getTime()) return 'overdue'
  return 'upcoming'
}

export function formatCrmDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(
    'en-GB',
    withTime
      ? {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}
      : {day: 'numeric', month: 'short', year: 'numeric'},
  ).format(new Date(iso))
}

export type {ClientActivityAction}
