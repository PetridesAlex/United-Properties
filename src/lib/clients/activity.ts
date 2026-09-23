import type {ClientActivity, ClientActivityAction} from '../../types/cms'
import {supabase} from '../supabase/client'

export type LogClientActivityInput = {
  clientId: string
  actorId?: string | null
  action: ClientActivityAction | string
  description: string
  propertyId?: string | null
  previousValue?: string | null
  newValue?: string | null
  metadata?: Record<string, unknown>
}

export async function logClientActivity(input: LogClientActivityInput): Promise<ClientActivity | null> {
  if (!supabase) return null

  const {data, error} = await supabase
    .from('client_activities')
    .insert({
      client_id: input.clientId,
      property_id: input.propertyId ?? null,
      actor_id: input.actorId ?? null,
      action: input.action,
      description: input.description,
      previous_value: input.previousValue ?? null,
      new_value: input.newValue ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single()

  if (error) {
    console.error('[client_activities]', error.message)
    return null
  }
  return data as ClientActivity
}

export type ActivityListFilters = {
  clientId?: string
  actorId?: string
  action?: string
  propertyId?: string
  from?: string
  to?: string
  limit?: number
}

export async function fetchClientActivities(
  filters: ActivityListFilters = {},
): Promise<ClientActivity[]> {
  if (!supabase) return []

  let query = supabase
    .from('client_activities')
    .select('*')
    .order('created_at', {ascending: false})

  if (filters.clientId) query = query.eq('client_id', filters.clientId)
  if (filters.actorId) query = query.eq('actor_id', filters.actorId)
  if (filters.action) query = query.eq('action', filters.action)
  if (filters.propertyId) query = query.eq('property_id', filters.propertyId)
  if (filters.from) query = query.gte('created_at', filters.from)
  if (filters.to) query = query.lte('created_at', filters.to)
  if (filters.limit) query = query.limit(filters.limit)

  const {data, error} = await query
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as ClientActivity[]
  if (rows.length === 0) return rows

  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[]
  const clientIds = [...new Set(rows.map((r) => r.client_id))]
  const propertyIds = [...new Set(rows.map((r) => r.property_id).filter(Boolean))] as string[]

  const [profilesRes, clientsRes, propertiesRes] = await Promise.all([
    actorIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', actorIds)
      : Promise.resolve({data: [] as {id: string; full_name: string | null; email: string}[]}),
    clientIds.length
      ? supabase.from('clients').select('id, first_name, last_name').in('id', clientIds)
      : Promise.resolve({data: [] as {id: string; first_name: string; last_name: string}[]}),
    propertyIds.length
      ? supabase.from('properties').select('id, reference_number, title').in('id', propertyIds)
      : Promise.resolve({
          data: [] as {id: string; reference_number: string | null; title: string}[],
        }),
  ])

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [
      p.id,
      p.full_name?.trim() || p.email?.split('@')[0] || 'Team',
    ]),
  )
  const clientMap = new Map(
    (clientsRes.data ?? []).map((c) => [
      c.id,
      [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || 'Client',
    ]),
  )
  const propertyMap = new Map(
    (propertiesRes.data ?? []).map((p) => [
      p.id,
      p.reference_number || p.title || p.id.slice(0, 8),
    ]),
  )

  return rows.map((row) => ({
    ...row,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    actor_name: row.actor_id ? profileMap.get(row.actor_id) ?? null : null,
    client_name: clientMap.get(row.client_id) ?? null,
    property_ref: row.property_id ? propertyMap.get(row.property_id) ?? null : null,
  }))
}

export async function fetchTeamActivitySummary() {
  if (!supabase) {
    return {
      clientsHandled: 0,
      clientsContacted: 0,
      propertiesSuggested: 0,
      followUpsCompleted: 0,
      viewingsScheduled: 0,
      dealsCompleted: 0,
      overdueFollowUps: 0,
    }
  }

  const since = new Date()
  since.setDate(since.getDate() - 30)
  const sinceIso = since.toISOString()

  const {data: activities} = await supabase
    .from('client_activities')
    .select('action, client_id')
    .gte('created_at', sinceIso)

  const rows = activities ?? []
  const handled = new Set(rows.map((r) => r.client_id as string))
  const count = (action: string) => rows.filter((r) => r.action === action).length

  const nowIso = new Date().toISOString()
  const {count: overdue} = await supabase
    .from('client_follow_ups')
    .select('id', {count: 'exact', head: true})
    .lt('starts_at', nowIso)
    .in('status', ['upcoming', 'today', 'overdue'])

  return {
    clientsHandled: handled.size,
    clientsContacted: count('client_contacted') + count('stage_changed'),
    propertiesSuggested: count('property_linked'),
    followUpsCompleted: count('follow_up_completed'),
    viewingsScheduled: count('viewing_scheduled'),
    dealsCompleted: count('deal_completed'),
    overdueFollowUps: overdue ?? 0,
  }
}
