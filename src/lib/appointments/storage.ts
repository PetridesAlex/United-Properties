import type {Appointment} from './types'

const STORAGE_KEY = 'up.adminAppointments.v1'

function readAll(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Appointment[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((row) => row && typeof row.id === 'string' && typeof row.date === 'string')
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
  } catch {
    return []
  }
}

function writeAll(rows: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

export function listAppointments(): Appointment[] {
  return readAll()
}

export function listAppointmentsForMonth(year: number, monthIndex: number): Appointment[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  return readAll().filter((row) => row.date.startsWith(prefix))
}

export function listUpcomingAppointments(limit = 6): Appointment[] {
  const today = new Date()
  const stamp = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  const nowTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`

  return readAll()
    .filter((row) => row.date > stamp || (row.date === stamp && row.endTime >= nowTime))
    .slice(0, limit)
}

export function upsertAppointment(
  input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> & {id?: string},
): Appointment {
  const rows = readAll()
  const now = new Date().toISOString()
  if (input.id) {
    const index = rows.findIndex((row) => row.id === input.id)
    if (index >= 0) {
      const next: Appointment = {
        ...rows[index],
        ...input,
        id: input.id,
        updatedAt: now,
      }
      rows[index] = next
      writeAll(rows)
      return next
    }
  }

  const created: Appointment = {
    id: crypto.randomUUID(),
    title: input.title.trim() || 'Untitled appointment',
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    type: input.type,
    location: input.location.trim(),
    notes: input.notes.trim(),
    createdAt: now,
    updatedAt: now,
  }
  rows.push(created)
  writeAll(rows)
  return created
}

export function deleteAppointment(id: string) {
  writeAll(readAll().filter((row) => row.id !== id))
}
