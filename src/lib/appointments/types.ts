export type AppointmentType = 'viewing' | 'meeting' | 'call' | 'other'

export type Appointment = {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  type: AppointmentType
  location: string
  notes: string
  createdAt: string
  updatedAt: string
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  viewing: 'Property viewing',
  meeting: 'Meeting',
  call: 'Call',
  other: 'Other',
}

export function emptyAppointment(date = ''): Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    date,
    startTime: '10:00',
    endTime: '11:00',
    type: 'meeting',
    location: '',
    notes: '',
  }
}
