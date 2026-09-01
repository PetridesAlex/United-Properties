import type {Client, ClientSource, ClientStatus} from '../../types/cms'

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Active',
  archived: 'Archived',
}

export const CLIENT_SOURCE_LABELS: Record<ClientSource, string> = {
  website: 'Website',
  manual: 'Manual',
}

export function parseFullName(fullName: string): {firstName: string; lastName: string} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return {firstName: 'Unknown', lastName: ''}
  if (parts.length === 1) return {firstName: parts[0], lastName: ''}
  return {firstName: parts[0], lastName: parts.slice(1).join(' ')}
}

export function formatClientName(client: Pick<Client, 'first_name' | 'last_name'>): string {
  return [client.first_name, client.last_name].filter(Boolean).join(' ').trim() || 'Unknown'
}

export function clientInitials(client: Pick<Client, 'first_name' | 'last_name'>): string {
  const first = client.first_name?.[0] ?? ''
  const last = client.last_name?.[0] ?? ''
  return `${first}${last}`.toUpperCase() || 'UP'
}

export function emptyClient(): Omit<Client, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'enquiry_count'> {
  return {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    source: 'manual',
    status: 'active',
    last_contact_at: null,
  }
}
