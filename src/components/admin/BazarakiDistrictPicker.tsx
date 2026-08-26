import {useEffect, useMemo, useRef, useState} from 'react'
import {
  formatDistrictLabel,
  getBazarakiDistrictById,
  searchBazarakiDistricts,
  type BazarakiDistrict,
} from '../../lib/integrations/bazaraki/districts'

type Props = {
  value: number | null
  onChange: (districtId: number | null, district?: BazarakiDistrict) => void
  onPostalCodeSuggest?: (postalCode: string) => void
}

export default function BazarakiDistrictPicker({value, onChange, onPostalCodeSuggest}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => getBazarakiDistrictById(value), [value])

  useEffect(() => {
    if (selected && !query) {
      setQuery(formatDistrictLabel(selected))
    }
  }, [selected, query])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const results = useMemo(() => searchBazarakiDistricts(query, 15), [query])

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
  }

  return (
    <div className="admin-field admin-district-picker" ref={wrapRef}>
      <label>Bazaraki district</label>
      <div className="admin-district-picker__input-wrap">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (!e.target.value.trim()) onChange(null)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by area, city, or postcode…"
          autoComplete="off"
        />
        {value != null ? (
          <button type="button" className="admin-district-picker__clear" onClick={clear}>
            Clear
          </button>
        ) : null}
      </div>
      {open && results.length > 0 ? (
        <ul className="admin-district-picker__list" role="listbox">
          {results.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => pick(d)}>
                <strong>{d.name}</strong>
                <span>{d.cityName}</span>
                {d.postCodes.length ? (
                  <span className="admin-district-picker__postcode">
                    {d.postCodes.slice(0, 3).join(', ')}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {value != null ? (
        <p className="admin-district-picker__id">Bazaraki district ID: {value}</p>
      ) : null}
    </div>
  )
}
