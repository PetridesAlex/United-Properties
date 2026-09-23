import type {Appointment, AppointmentType} from './types'
import {supabase} from '../supabase/client'

export type AppointmentRow = {
  id: string
  title: string
  starts_on: string
  start_time: string
  end_time: string
  appointment_type: string
  location: string | null
  notes: string | null
  client_id?: string | null
  property_id?: string | null
  follow_up_id?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

function trimTime(value: string) {
  return value.slice(0, 5)
}

export function mapAppointmentRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    title: row.title,
    date: row.starts_on,
    startTime: trimTime(row.start_time),
    endTime: trimTime(row.end_time),
    type: (row.appointment_type as AppointmentType) || 'meeting',
    location: row.location ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientId: row.client_id ?? null,
    propertyId: row.property_id ?? null,
    followUpId: row.follow_up_id ?? null,
  }
}

export async function listAppointmentsForMonth(year: number, monthIndex: number): Promise<Appointment[]> {
  if (!supabase) return []
  const month = monthIndex + 1
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  // Day 0 of next month = last day of this month (handles 28/29/30/31 correctly)
  const lastDay = new Date(year, month, 0).getDate()
  const {data, error} = await supabase
    .from('admin_appointments')
    .select('*')
    .gte('starts_on', `${prefix}-01`)
    .lte('starts_on', `${prefix}-${String(lastDay).padStart(2, '0')}`)
    .order('starts_on', {ascending: true})
    .order('start_time', {ascending: true})

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapAppointmentRow(row as AppointmentRow))
}

export async function listUpcomingAppointments(limit = 6): Promise<Appointment[]> {
  if (!supabase) return []
  const today = new Date()
  const stamp = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const {data, error} = await supabase
    .from('admin_appointments')
    .select('*')
    .gte('starts_on', stamp)
    .order('starts_on', {ascending: true})
    .order('start_time', {ascending: true})
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapAppointmentRow(row as AppointmentRow))
}

export async function upsertAppointmentRemote(
  input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string
    createdBy?: string | null
  },
): Promise<Appointment> {
  if (!supabase) throw new Error('Supabase is not configured')

  const payload = {
    title: input.title.trim() || 'Untitled appointment',
    starts_on: input.date,
    start_time: `${input.startTime}:00`,
    end_time: `${input.endTime}:00`,
    appointment_type: input.type,
    location: input.location.trim(),
    notes: input.notes.trim(),
    client_id: input.clientId ?? null,
    property_id: input.propertyId ?? null,
    follow_up_id: input.followUpId ?? null,
    created_by: input.createdBy ?? null,
  }

  if (input.id) {
    const {data, error} = await supabase
      .from('admin_appointments')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return mapAppointmentRow(data as AppointmentRow)
  }

  const {data, error} = await supabase
    .from('admin_appointments')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapAppointmentRow(data as AppointmentRow)
}

export async function deleteAppointmentRemote(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const {error} = await supabase.from('admin_appointments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** One-time import of legacy localStorage appointments into Supabase. */
export async function migrateLocalAppointmentsIfNeeded(userId?: string | null) {
  if (!supabase || typeof window === 'undefined') return
  const flagKey = 'up.adminAppointments.migrated.v1'
  if (localStorage.getItem(flagKey)) return

  try {
    const raw = localStorage.getItem('up.adminAppointments.v1')
    if (!raw) {
      localStorage.setItem(flagKey, '1')
      return
    }
    const parsed = JSON.parse(raw) as Appointment[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(flagKey, '1')
      return
    }

    const {count} = await supabase
      .from('admin_appointments')
      .select('id', {count: 'exact', head: true})
    if ((count ?? 0) > 0) {
      localStorage.setItem(flagKey, '1')
      return
    }

    const rows = parsed.map((row) => ({
      title: row.title,
      starts_on: row.date,
      start_time: `${row.startTime}:00`,
      end_time: `${row.endTime}:00`,
      appointment_type: row.type,
      location: row.location,
      notes: row.notes,
      created_by: userId ?? null,
    }))
    await supabase.from('admin_appointments').insert(rows)
    localStorage.setItem(flagKey, '1')
  } catch {
    // Keep local calendar usable if remote migration fails.
  }
}
