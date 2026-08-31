import {useEffect, useMemo, useState, type CSSProperties} from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  deleteAppointment,
  listAppointmentsForMonth,
  upsertAppointment,
} from '../../lib/appointments/storage'
import {
  APPOINTMENT_TYPE_LABELS,
  emptyAppointment,
  type Appointment,
  type AppointmentType,
} from '../../lib/appointments/types'
import '../../components/admin/AdminShell.css'
import './AdminCalendarPage.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function monthLabel(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthIndex, 1))
}

function buildMonthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const startOffset = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: Array<{key: string; inMonth: boolean; day: number} | null> = []

  for (let i = 0; i < startOffset; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({key, inMonth: true, day})
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function formatWhen(row: Appointment) {
  return `${row.startTime} – ${row.endTime}`
}

export default function AdminCalendarPage() {
  const todayKey = toDateKey(new Date())
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return {year: now.getFullYear(), month: now.getMonth()}
  })
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [rows, setRows] = useState<Appointment[]>([])
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [draft, setDraft] = useState(() => emptyAppointment(todayKey))
  const [panelOpen, setPanelOpen] = useState(false)

  function refresh() {
    setRows(listAppointmentsForMonth(cursor.year, cursor.month))
  }

  useEffect(() => {
    refresh()
  }, [cursor.year, cursor.month])

  const cells = useMemo(
    () => buildMonthCells(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  )

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const row of rows) {
      const list = map.get(row.date) ?? []
      list.push(row)
      map.set(row.date, list)
    }
    return map
  }, [rows])

  const dayAppointments = useMemo(
    () => (byDate.get(selectedDate) ?? []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [byDate, selectedDate],
  )

  const isSelectedToday = selectedDate === todayKey

  function openCreate(date = selectedDate) {
    setEditing(null)
    setDraft(emptyAppointment(date))
    setSelectedDate(date)
    setPanelOpen(true)
  }

  function openEdit(row: Appointment) {
    setEditing(row)
    setDraft({
      title: row.title,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      type: row.type,
      location: row.location,
      notes: row.notes,
    })
    setSelectedDate(row.date)
    setPanelOpen(true)
  }

  function save() {
    if (!draft.title.trim()) {
      toast.error('Add a meeting title')
      return
    }
    if (!draft.date) {
      toast.error('Choose a date')
      return
    }
    if (draft.endTime <= draft.startTime) {
      toast.error('End time must be after start time')
      return
    }

    const saved = upsertAppointment({
      ...draft,
      id: editing?.id,
    })
    refresh()
    setSelectedDate(saved.date)
    setPanelOpen(false)
    toast.success(editing ? 'Appointment updated' : 'Appointment saved')
  }

  function remove(id: string) {
    deleteAppointment(id)
    refresh()
    if (editing?.id === id) setPanelOpen(false)
    toast.success('Appointment removed')
  }

  function shiftMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return {year: next.getFullYear(), month: next.getMonth()}
    })
  }

  return (
    <div className="admin-page cal-admin">
      <header className="cal-admin__hero">
        <div>
          <p className="cal-admin__eyebrow">Schedule</p>
          <h1>
            <CalendarDays size={22} aria-hidden />
            Meetings & appointments
          </h1>
          <p className="cal-admin__lede">
            Plan viewings, client meetings, and calls — saved on this device for quick access.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn--gold" onClick={() => openCreate()}>
          <Plus size={16} aria-hidden />
          New appointment
        </button>
      </header>

      <div className="cal-admin__layout">
        <section className="cal-admin__calendar" aria-label="Month calendar">
          <div className="cal-admin__month-bar">
            <button type="button" className="cal-admin__nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <h2>{monthLabel(cursor.year, cursor.month)}</h2>
            <button type="button" className="cal-admin__nav-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="cal-admin__weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="cal-admin__grid">
            {cells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="cal-admin__cell is-empty" />
              const count = byDate.get(cell.key)?.length ?? 0
              const isSelected = cell.key === selectedDate
              const isToday = cell.key === todayKey
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    'cal-admin__cell',
                    isSelected ? 'is-selected' : '',
                    isToday ? 'is-today' : '',
                    count ? 'has-events' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    setSelectedDate(cell.key)
                    setPanelOpen(false)
                  }}
                  onDoubleClick={() => openCreate(cell.key)}
                >
                  <span className="cal-admin__day-num">{cell.day}</span>
                  {count > 0 ? <span className="cal-admin__day-dots" aria-label={`${count} appointments`} /> : null}
                </button>
              )
            })}
          </div>
        </section>

        <aside className="cal-admin__side">
          <div
            key={selectedDate}
            className={`cal-admin__day-panel${dayAppointments.length ? ' has-alerts' : ''}${isSelectedToday ? ' is-today' : ''}`}
          >
            <header className="cal-admin__day-head">
              <div>
                <p className="cal-admin__eyebrow cal-admin__day-live">
                  <span className="cal-admin__live-dot" aria-hidden />
                  {isSelectedToday ? 'Today' : 'Selected day'}
                  {dayAppointments.length > 0 ? (
                    <span className="cal-admin__day-count">
                      {dayAppointments.length} alert{dayAppointments.length === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </p>
                <h2>
                  {new Intl.DateTimeFormat('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }).format(parseDateKey(selectedDate))}
                </h2>
              </div>
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => openCreate(selectedDate)}>
                <Plus size={15} aria-hidden />
                Add
              </button>
            </header>

            {dayAppointments.length === 0 ? (
              <div className="cal-admin__empty-state">
                <span className="cal-admin__empty-icon" aria-hidden>
                  <CalendarDays size={22} strokeWidth={1.8} />
                </span>
                <p className="cal-admin__empty">Clear day — tap Add or double-click the date to schedule.</p>
              </div>
            ) : (
              <ul className="cal-admin__list">
                {dayAppointments.map((row, index) => (
                  <li key={row.id} style={{'--cal-i': index} as CSSProperties}>
                    <button
                      type="button"
                      className={`cal-admin__card cal-admin__card--${row.type}`}
                      onClick={() => openEdit(row)}
                    >
                      <span className="cal-admin__card-icon" aria-hidden>
                        <CalendarDays size={18} strokeWidth={2} />
                      </span>
                      <span className="cal-admin__card-body">
                        <span className="cal-admin__card-top">
                          <span className="cal-admin__card-app">
                            <span className="cal-admin__card-pulse" aria-hidden />
                            United Calendar
                          </span>
                          <span className={`cal-admin__type cal-admin__type--${row.type}`}>
                            {APPOINTMENT_TYPE_LABELS[row.type]}
                          </span>
                        </span>
                        <strong className="cal-admin__card-title">{row.title}</strong>
                        <span className="cal-admin__card-meta">
                          <span className="cal-admin__card-time">
                            <Clock3 size={13} aria-hidden />
                            {formatWhen(row)}
                          </span>
                          {row.location ? (
                            <span className="cal-admin__card-place">
                              <MapPin size={13} aria-hidden />
                              {row.location}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="cal-admin__icon-delete"
                      aria-label={`Delete ${row.title}`}
                      onClick={() => remove(row.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {panelOpen ? (
        <div className="cal-admin__overlay" role="presentation" onClick={() => setPanelOpen(false)}>
          <div
            className="cal-admin__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="appointment-dialog-title">{editing ? 'Edit appointment' : 'New appointment'}</h2>
            <div className="cal-admin__form">
              <label className="admin-field">
                <span>Title</span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({...prev, title: e.target.value}))}
                  placeholder="Client viewing · Limassol Marina"
                />
              </label>
              <div className="cal-admin__row">
                <label className="admin-field">
                  <span>Type</span>
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft((prev) => ({...prev, type: e.target.value as AppointmentType}))
                    }
                  >
                    {(Object.keys(APPOINTMENT_TYPE_LABELS) as AppointmentType[]).map((key) => (
                      <option key={key} value={key}>
                        {APPOINTMENT_TYPE_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((prev) => ({...prev, date: e.target.value}))}
                  />
                </label>
              </div>
              <div className="cal-admin__time-row">
                <label className="admin-field">
                  <span>Starts</span>
                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(e) => setDraft((prev) => ({...prev, startTime: e.target.value}))}
                  />
                </label>
                <label className="admin-field">
                  <span>Ends</span>
                  <input
                    type="time"
                    value={draft.endTime}
                    onChange={(e) => setDraft((prev) => ({...prev, endTime: e.target.value}))}
                  />
                </label>
              </div>
              <label className="admin-field">
                <span>Location</span>
                <input
                  value={draft.location}
                  onChange={(e) => setDraft((prev) => ({...prev, location: e.target.value}))}
                  placeholder="Office / property address"
                />
              </label>
              <label className="admin-field">
                <span>Notes</span>
                <textarea
                  rows={2}
                  value={draft.notes}
                  onChange={(e) => setDraft((prev) => ({...prev, notes: e.target.value}))}
                  placeholder="Agenda, contacts, reminders…"
                />
              </label>
            </div>
            <div className="admin-actions cal-admin__dialog-actions">
              {editing ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => remove(editing.id)}
                >
                  Delete
                </button>
              ) : null}
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPanelOpen(false)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn--gold" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
