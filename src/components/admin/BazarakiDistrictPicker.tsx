import {useEffect, useMemo, useRef, useState, type KeyboardEvent} from 'react'
import {Check, ChevronDown, MapPin, Search, X} from 'lucide-react'
import {
  formatDistrictLabel,
  getAllBazarakiDistricts,
  getBazarakiDistrictById,
  searchBazarakiDistricts,
  type BazarakiDistrict,
} from '../../lib/integrations/bazaraki/districts'

type Props = {
  value: number | null
  onChange: (districtId: number | null, district?: BazarakiDistrict) => void
  onPostalCodeSuggest?: (postalCode: string) => void
}

const DISTRICT_COUNT = getAllBazarakiDistricts().length

export default function BazarakiDistrictPicker({value, onChange, onPostalCodeSuggest}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = useMemo(() => getBazarakiDistrictById(value), [value])

  useEffect(() => {
    if (selected && !open) {
      setQuery(formatDistrictLabel(selected))
    }
  }, [selected, open])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (selected) setQuery(formatDistrictLabel(selected))
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [selected])

  const results = useMemo(() => searchBazarakiDistricts(query, 12), [query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({block: 'nearest'})
  }, [activeIndex, open])

  function pick(d: BazarakiDistrict) {
    onChange(d.id, d)
    setQuery(formatDistrictLabel(d))
    setOpen(false)
    if (onPostalCodeSuggest && d.postCodes[0] != null) {
      onPostalCodeSuggest(String(d.postCodes[0]))
    }
  }

  function clear() {
    onChange(null)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function openPicker() {
    setOpen(true)
    if (selected) setQuery('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return

    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      if (selected) setQuery(formatDistrictLabel(selected))
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      pick(results[activeIndex])
    }
  }

  const listId = 'bazaraki-district-list'

  return (
    <div className="admin-field admin-district-picker">
      <label htmlFor="bazaraki-district-input">Bazaraki district</label>

      <div
        className={`admin-district-picker__combobox${open ? ' is-open' : ''}${value != null ? ' has-value' : ''}`}
        ref={wrapRef}
      >
        <div className="admin-district-picker__input-wrap">
          <Search className="admin-district-picker__icon admin-district-picker__icon--search" aria-hidden />
          <input
            id="bazaraki-district-input"
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              if (!e.target.value.trim()) onChange(null)
            }}
            onFocus={openPicker}
            onKeyDown={onKeyDown}
            placeholder="Search by area, city, or postcode…"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
          />
          <button
            type="button"
            className="admin-district-picker__toggle"
            onMouseDown={(e) => {
              e.preventDefault()
              if (open) setOpen(false)
              else openPicker()
            }}
            aria-label={open ? 'Close district list' : 'Open district list'}
          >
            <ChevronDown aria-hidden />
          </button>
          {value != null ? (
            <button type="button" className="admin-district-picker__clear" onClick={clear} aria-label="Clear district">
              <X aria-hidden />
            </button>
          ) : null}
        </div>

        {open ? (
          <div className="admin-district-picker__panel">
            <div className="admin-district-picker__panel-head">
              <MapPin aria-hidden />
              <span>
                {query.trim()
                  ? `${results.length} match${results.length === 1 ? '' : 'es'}`
                  : `${DISTRICT_COUNT} Cyprus districts`}
              </span>
            </div>

            {results.length > 0 ? (
              <ul className="admin-district-picker__list" id={listId} role="listbox" ref={listRef}>
                {results.map((d, index) => {
                  const isSelected = value === d.id
                  const isActive = index === activeIndex
                  return (
                    <li key={d.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        data-active={isActive ? 'true' : undefined}
                        className={isSelected ? 'is-selected' : undefined}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(d)}
                      >
                        <span className="admin-district-picker__item-main">
                          <strong>{d.name}</strong>
                          <span className="admin-district-picker__city">{d.cityName}</span>
                        </span>
                        <span className="admin-district-picker__item-end">
                          {d.postCodes.length ? (
                            <span className="admin-district-picker__postcode">
                              {d.postCodes.slice(0, 2).join(' · ')}
                            </span>
                          ) : null}
                          {isSelected ? <Check className="admin-district-picker__check" aria-hidden /> : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="admin-district-picker__empty">No districts match &ldquo;{query}&rdquo;</p>
            )}
          </div>
        ) : null}
      </div>

      {value != null ? (
        <p className="admin-district-picker__meta">
          <span className="admin-district-picker__meta-label">District ID</span>
          <span className="admin-district-picker__meta-value">{value}</span>
        </p>
      ) : null}
    </div>
  )
}
