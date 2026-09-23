import type {
  ClientFollowUp,
  ClientFollowUpStatus,
  ClientFollowUpType,
} from '../../types/cms'
import {supabase} from '../supabase/client'
import {logClientActivity} from './activity'
import {followUpTypeLabel, resolveFollowUpStatus} from './crmLabels'
import {staffDisplayName} from './staff'

function toDateAndTimes(startsAt: string, durationMinutes = 60) {
  const start = new Date(startsAt)
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    starts_on: [
      start.getFullYear(),
      pad(start.getMonth() + 1),
      pad(start.getDate()),
    ].join('-'),
    start_time: `${pad(start.getHours())}:${pad(start.getMinutes())}:00`,
    end_time: `${pad(end.getHours())}:${pad(end.getMinutes())}:00`,
  }
}

function shouldSyncToCalendar(type: string) {
  return type === 'viewing' || type === 'meeting' || type === 'phone_call'
}

function appointmentTypeFromFollowUp(type: string): 'viewing' | 'meeting' | 'call' | 'other' {
  if (type === 'viewing') return 'viewing'
  if (type === 'meeting') return 'meeting'
  if (type === 'phone_call') return 'call'
  return 'other'
}

async function syncAppointmentForFollowUp(row: ClientFollowUp, actorId?: string | null) {
  if (!supabase) return
  if (!shouldSyncToCalendar(row.type) || row.status === 'cancelled') {
    await supabase.from('admin_appointments').delete().eq('follow_up_id', row.id)
    return
  }

  const times = toDateAndTimes(row.starts_at)
  const title =
    row.title.trim() ||
    `${followUpTypeLabel(row.type)}${row.property_ref ? ` · ${row.property_ref}` : ''}`

  const payload = {
    title,
    starts_on: times.starts_on,
    start_time: times.start_time,
    end_time: times.end_time,
    appointment_type: appointmentTypeFromFollowUp(row.type),
    location: '',
    notes: row.notes ?? '',
    client_id: row.client_id,
    property_id: row.property_id,
    follow_up_id: row.id,
    created_by: actorId ?? null,
  }

  const {data: existing} = await supabase
    .from('admin_appointments')
    .select('id')
    .eq('follow_up_id', row.id)
    .maybeSingle()

  if (existing?.id) {
    await supabase.from('admin_appointments').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('admin_appointments').insert(payload)
  }
}

async function hydrateFollowUps(rows: ClientFollowUp[]): Promise<ClientFollowUp[]> {
  if (!supabase || rows.length === 0) return rows

  const assigneeIds = [...new Set(rows.map((r) => r.assigned_to).filter(Boolean))] as string[]
  const propertyIds = [...new Set(rows.map((r) => r.property_id).filter(Boolean))] as string[]

  const [profilesRes, propsRes] = await Promise.all([
    assigneeIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', assigneeIds)
      : Promise.resolve({data: [] as {id: string; full_name: string | null; email: string}[]}),
    propertyIds.length
      ? supabase.from('properties').select('id, reference_number, title').in('id', propertyIds)
      : Promise.resolve({
          data: [] as {id: string; reference_number: string | null; title: string}[],
        }),
  ])

  const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, staffDisplayName(p)]))
  const propMap = new Map(
    (propsRes.data ?? []).map((p) => [
      p.id as string,
      {
        ref: (p.reference_number as string | null) || null,
        title: p.title as string,
      },
    ]),
  )

  return rows.map((row) => {
    const prop = row.property_id ? propMap.get(row.property_id) : null
    const resolved = resolveFollowUpStatus(row.starts_at, row.status)
    return {
      ...row,
      status: resolved,
      assigned_name: row.assigned_to ? profileMap.get(row.assigned_to) ?? null : null,
      property_ref: prop?.ref ?? null,
      property_title: prop?.title ?? null,
    }
  })
}

export async function fetchClientFollowUps(clientId: string): Promise<ClientFollowUp[]> {
  if (!supabase) return []
  const {data, error} = await supabase
    .from('client_follow_ups')
    .select('*')
    .eq('client_id', clientId)
    .order('starts_at', {ascending: true})

  if (error) throw new Error(error.message)
  return hydrateFollowUps((data ?? []) as ClientFollowUp[])
}

export async function fetchNextFollowUp(clientId: string): Promise<ClientFollowUp | null> {
  const rows = await fetchClientFollowUps(clientId)
  return (
    rows.find((r) => r.status === 'today' || r.status === 'upcoming' || r.status === 'overdue') ??
    null
  )
}

export type FollowUpWriteInput = {
  clientId: string
  propertyId?: string | null
  assignedTo?: string | null
  startsAt: string
  type: ClientFollowUpType
  title?: string
  notes?: string | null
  status?: ClientFollowUpStatus
  actorId?: string | null
}

export async function createFollowUp(input: FollowUpWriteInput): Promise<ClientFollowUp> {
  if (!supabase) throw new Error('Supabase is not configured')

  const status = resolveFollowUpStatus(input.startsAt, input.status ?? 'upcoming')
  const {data, error} = await supabase
    .from('client_follow_ups')
    .insert({
      client_id: input.clientId,
      property_id: input.propertyId ?? null,
      assigned_to: input.assignedTo ?? input.actorId ?? null,
      starts_at: input.startsAt,
      type: input.type,
      status,
      title: input.title?.trim() || followUpTypeLabel(input.type),
      notes: input.notes?.trim() || null,
      created_by: input.actorId ?? null,
      updated_by: input.actorId ?? null,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  const [hydrated] = await hydrateFollowUps([data as ClientFollowUp])
  await syncAppointmentForFollowUp(hydrated, input.actorId)

  const isViewing = input.type === 'viewing'
  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: isViewing ? 'viewing_scheduled' : 'follow_up_created',
    propertyId: input.propertyId,
    description: isViewing
      ? `Scheduled a viewing${hydrated.property_ref ? ` for ${hydrated.property_ref}` : ''}.`
      : `Created ${followUpTypeLabel(input.type).toLowerCase()}.`,
  })

  return hydrated
}

export async function updateFollowUp(
  id: string,
  input: Partial<FollowUpWriteInput> & {status?: ClientFollowUpStatus},
): Promise<ClientFollowUp> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data: existing, error: fetchError} = await supabase
    .from('client_follow_ups')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const startsAt = input.startsAt ?? (existing.starts_at as string)
  const nextStatus = input.status
    ? resolveFollowUpStatus(startsAt, input.status)
    : resolveFollowUpStatus(startsAt, existing.status as string)

  const {data, error} = await supabase
    .from('client_follow_ups')
    .update({
      property_id: input.propertyId !== undefined ? input.propertyId : existing.property_id,
      assigned_to: input.assignedTo !== undefined ? input.assignedTo : existing.assigned_to,
      starts_at: startsAt,
      type: input.type ?? existing.type,
      status: nextStatus,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      notes: input.notes !== undefined ? input.notes?.trim() || null : existing.notes,
      updated_by: input.actorId ?? null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  const [hydrated] = await hydrateFollowUps([data as ClientFollowUp])
  await syncAppointmentForFollowUp(hydrated, input.actorId)

  const prevStatus = existing.status as string
  if (nextStatus === 'completed' && prevStatus !== 'completed') {
    const isViewing = hydrated.type === 'viewing'
    await logClientActivity({
      clientId: hydrated.client_id,
      actorId: input.actorId,
      action: isViewing ? 'viewing_completed' : 'follow_up_completed',
      propertyId: hydrated.property_id,
      description: isViewing
        ? `Completed viewing${hydrated.property_ref ? ` for ${hydrated.property_ref}` : ''}.`
        : `Completed ${followUpTypeLabel(hydrated.type).toLowerCase()}.`,
    })
  } else if (nextStatus === 'cancelled' && prevStatus !== 'cancelled') {
    await logClientActivity({
      clientId: hydrated.client_id,
      actorId: input.actorId,
      action: 'follow_up_cancelled',
      propertyId: hydrated.property_id,
      description: `Cancelled ${followUpTypeLabel(hydrated.type).toLowerCase()}.`,
    })
  }

  return hydrated
}

export async function completeFollowUp(id: string, actorId?: string | null) {
  return updateFollowUp(id, {status: 'completed', actorId})
}
