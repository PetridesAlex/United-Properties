import type {
  Client,
  ClientProcessStage,
  ClientStatus,
  ClientType,
  Inquiry,
} from '../../types/cms'
import {supabase} from '../supabase/client'
import {logClientActivity} from './activity'
import {stageLabel} from './crmLabels'
import {formatClientName} from './types'
import {staffDisplayName} from './staff'

export type AdminClientFilters = {
  search?: string
  status?: ClientStatus | 'all'
  assignedTo?: string | 'all'
  processStage?: ClientProcessStage | 'all'
  followUpDue?: boolean
  dateFrom?: string
  dateTo?: string
  limit?: number
}

export async function fetchAdminClients(filters: AdminClientFilters = {}): Promise<Client[]> {
  if (!supabase) return []

  let query = supabase
    .from('clients')
    .select('*')
    .order('last_contact_at', {ascending: false, nullsFirst: false})
    .order('created_at', {ascending: false})

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.assignedTo && filters.assignedTo !== 'all') {
    query = query.eq('assigned_to', filters.assignedTo)
  }
  if (filters.processStage && filters.processStage !== 'all') {
    query = query.eq('process_stage', filters.processStage)
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59.999Z`)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const {data, error} = await query
  if (error) throw new Error(error.message)

  let rows = (data ?? []) as Client[]

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    rows = rows.filter((row) => {
      const hay = [formatClientName(row), row.email ?? '', row.phone ?? '', row.notes ?? '']
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  const ids = rows.map((r) => r.id)
  if (ids.length === 0) return rows

  const assigneeIds = [...new Set(rows.map((r) => r.assigned_to).filter(Boolean))] as string[]

  const [inquiryRows, linkRows, followRows, activityRows, profilesRes] = await Promise.all([
    supabase.from('inquiries').select('client_id').in('client_id', ids),
    supabase.from('client_properties').select('client_id').in('client_id', ids),
    supabase
      .from('client_follow_ups')
      .select('client_id, starts_at, status')
      .in('client_id', ids)
      .in('status', ['upcoming', 'today', 'overdue'])
      .order('starts_at', {ascending: true}),
    supabase
      .from('client_activities')
      .select('client_id, created_at')
      .in('client_id', ids)
      .order('created_at', {ascending: false}),
    assigneeIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', assigneeIds)
      : Promise.resolve({data: [] as {id: string; full_name: string | null; email: string}[]}),
  ])

  const enquiryCounts = new Map<string, number>()
  for (const row of inquiryRows.data ?? []) {
    const id = row.client_id as string | null
    if (!id) continue
    enquiryCounts.set(id, (enquiryCounts.get(id) ?? 0) + 1)
  }

  const propertyCounts = new Map<string, number>()
  for (const row of linkRows.data ?? []) {
    const id = row.client_id as string
    propertyCounts.set(id, (propertyCounts.get(id) ?? 0) + 1)
  }

  const nextFollowUp = new Map<string, string>()
  for (const row of followRows.data ?? []) {
    const id = row.client_id as string
    if (!nextFollowUp.has(id)) nextFollowUp.set(id, row.starts_at as string)
  }

  const lastActivity = new Map<string, string>()
  for (const row of activityRows.data ?? []) {
    const id = row.client_id as string
    if (!lastActivity.has(id)) lastActivity.set(id, row.created_at as string)
  }

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, staffDisplayName(p)]),
  )

  let enriched = rows.map((row) => ({
    ...row,
    process_stage: row.process_stage || 'new_lead',
    enquiry_count: enquiryCounts.get(row.id) ?? 0,
    properties_count: propertyCounts.get(row.id) ?? 0,
    next_follow_up_at: nextFollowUp.get(row.id) ?? null,
    last_activity_at: lastActivity.get(row.id) ?? row.updated_at,
    assigned_name: row.assigned_to ? profileMap.get(row.assigned_to) ?? null : null,
  }))

  if (filters.followUpDue) {
    const now = Date.now()
    enriched = enriched.filter((row) => {
      if (!row.next_follow_up_at) return false
      const t = new Date(row.next_follow_up_at).getTime()
      const endOfTomorrow = new Date()
      endOfTomorrow.setHours(23, 59, 59, 999)
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
      return t <= endOfTomorrow.getTime() || t < now
    })
  }

  return enriched
}

export async function fetchRecentClients(limit = 5): Promise<Client[]> {
  return fetchAdminClients({status: 'active', limit})
}

export async function fetchClientById(id: string): Promise<Client | null> {
  if (!supabase) return null
  const {data, error} = await supabase.from('clients').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null

  const row = data as Client
  const [{count}, profileRes] = await Promise.all([
    supabase.from('inquiries').select('id', {count: 'exact', head: true}).eq('client_id', id),
    row.assigned_to
      ? supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', row.assigned_to)
          .maybeSingle()
      : Promise.resolve({data: null}),
  ])

  return {
    ...row,
    process_stage: row.process_stage || 'new_lead',
    enquiry_count: count ?? 0,
    assigned_name: profileRes.data ? staffDisplayName(profileRes.data) : null,
  }
}

export async function fetchClientInquiries(clientId: string): Promise<Inquiry[]> {
  if (!supabase) return []
  const {data, error} = await supabase
    .from('inquiries')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', {ascending: false})

  if (error) throw new Error(error.message)
  return (data ?? []) as Inquiry[]
}

export type ClientWriteInput = {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  notes?: string | null
  source?: string
  status?: string
  process_stage?: ClientProcessStage | string
  client_type?: ClientType | string | null
  assigned_to?: string | null
  last_contact_at?: string | null
  created_by?: string | null
}

function normalizeWrite(input: ClientWriteInput) {
  return {
    first_name: input.first_name.trim() || 'Unknown',
    last_name: (input.last_name ?? '').trim(),
    email: input.email?.trim() ? input.email.trim().toLowerCase() : null,
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || null,
    source: input.source ?? 'manual',
    status: input.status ?? 'active',
    process_stage: input.process_stage ?? 'new_lead',
    client_type: input.client_type || null,
    assigned_to: input.assigned_to || null,
    last_contact_at: input.last_contact_at ?? null,
  }
}

export async function createClient(input: ClientWriteInput, userId?: string | null): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const payload = {
    ...normalizeWrite(input),
    last_contact_at: input.last_contact_at ?? new Date().toISOString(),
    created_by: userId ?? null,
    assigned_to: input.assigned_to ?? userId ?? null,
  }

  const {data, error} = await supabase.from('clients').insert(payload).select('*').single()
  if (error) throw new Error(error.message)

  const client = data as Client
  await logClientActivity({
    clientId: client.id,
    actorId: userId,
    action: 'client_created',
    description: 'Created the client.',
  })

  return client
}

export async function updateClient(
  id: string,
  input: ClientWriteInput,
  actorId?: string | null,
): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update(normalizeWrite(input))
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: id,
    actorId,
    action: 'client_updated',
    description: 'Updated client details.',
  })

  return data as Client
}

export async function updateClientStage(input: {
  clientId: string
  stage: ClientProcessStage
  actorId?: string | null
  previousStage?: string | null
}): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update({process_stage: input.stage})
    .eq('id', input.clientId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: 'stage_changed',
    description: `Changed client status: "${stageLabel(input.previousStage)}" → "${stageLabel(input.stage)}"`,
    previousValue: stageLabel(input.previousStage),
    newValue: stageLabel(input.stage),
  })

  if (input.stage === 'completed') {
    await logClientActivity({
      clientId: input.clientId,
      actorId: input.actorId,
      action: 'deal_completed',
      description: 'Marked deal as completed.',
    })
  }

  return data as Client
}

export async function updateClientAssignee(input: {
  clientId: string
  assignedTo: string | null
  actorId?: string | null
}): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update({assigned_to: input.assignedTo})
    .eq('id', input.clientId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: 'client_updated',
    description: input.assignedTo ? 'Updated assigned employee.' : 'Cleared assigned employee.',
    newValue: input.assignedTo,
  })

  return data as Client
}

export async function touchClientContact(clientId: string, actorId?: string | null) {
  if (!supabase) throw new Error('Supabase is not configured')
  const now = new Date().toISOString()
  const {data, error} = await supabase
    .from('clients')
    .update({last_contact_at: now})
    .eq('id', clientId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId,
    actorId,
    action: 'client_contacted',
    description: 'Contacted the client.',
  })

  return data as Client
}

export async function archiveClient(id: string, actorId?: string | null): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update({status: 'archived'})
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: id,
    actorId,
    action: 'client_archived',
    description: 'Archived the client.',
  })

  return data as Client
}

export async function restoreClient(id: string, actorId?: string | null): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update({status: 'active'})
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: id,
    actorId,
    action: 'client_restored',
    description: 'Restored the client.',
  })

  return data as Client
}

export async function deleteClient(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {error} = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
