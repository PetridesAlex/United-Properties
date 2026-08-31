import {useEffect, useMemo, useRef, useState, type KeyboardEvent} from 'react'
import {Check, ChevronDown, MapPin, Search, X} from 'lucide-react'
import {
  formatAreaName,
  formatDistrictLabel,
  getAreasForRegion,
  getBazarakiDistrictById,
  getBazarakiRegionById,
  getBazarakiRegionByName,
  getBazarakiRegions,
  getCitiesForRegion,
  resolveBazarakiLocation,
  searchBazarakiDistricts,
  toCmsLocationFields,
  type BazarakiDistrict,
} from '../../lib/integrations/bazaraki/districts'

export type BazarakiLocationValue = {
  district: string
  city: string
  area: string
  bazarakiDistrictId: number | null
}

type Props = {
  value: BazarakiLocationValue
  onChange: (next: BazarakiLocationValue & {postalCode?: string}) => void
}

function resolveCityForRegion(regionId: number | null, fallback = ''): string {
  if (regionId == null) return fallback
  const cities = getCitiesForRegion(regionId)
  if (cities.length === 1) return cities[0].name
  return getBazarakiRegionById(regionId)?.name ?? fallback
}

export default function BazarakiLocationPicker({value, onChange}: Props) {
  const regions = useMemo(() => getBazarakiRegions(), [])

  const resolved = useMemo(
    () => resolveBazarakiLocation(value.bazarakiDistrictId),
    [value.bazarakiDistrictId],
  )

  const [regionId, setRegionId] = useState<number | null>(() => {
    if (resolved) return resolved.region.id
    return (
      getBazarakiRegionByName(value.district)?.id ??
      getBazarakiRegionByName(value.city)?.id ??
      null
    )
  })

  const cityName = useMemo(
    () => resolved?.city.name ?? resolveCityForRegion(regionId, value.city),
    [resolved, regionId, value.city],
  )

  useEffect(() => {
    if (resolved) {
      setRegionId(resolved.region.id)
      setAreaQuery(resolved.district.areaName)
      return
    }
    const region =
      getBazarakiRegionByName(value.district) ?? getBazarakiRegionByName(value.city)
    setRegionId(region?.id ?? null)
    setAreaQuery(value.area)
  }, [resolved, value.district, value.city, value.area])

  const areas = useMemo(() => getAreasForRegion(regionId), [regionId])

  const [areaQuery, setAreaQuery] = useState(value.area)
  const [areaOpen, setAreaOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const areaWrapRef = useRef<HTMLDivElement>(null)
  const areaInputRef = useRef<HTMLInputElement>(null)
  const areaListRef = useRef<HTMLUListElement>(null)

  const selectedArea = useMemo(
    () => getBazarakiDistrictById(value.bazarakiDistrictId),
    [value.bazarakiDistrictId],
  )

  const areaResults = useMemo(
    () => searchBazarakiDistricts(areaQuery, 16, regionId),
    [areaQuery, regionId],
  )

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (areaWrapRef.current && !areaWrapRef.current.contains(e.target as Node)) {
        setAreaOpen(false)
        if (selectedArea) setAreaQuery(selectedArea.areaName)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [selectedArea])

  useEffect(() => {
    setActiveIndex(0)
  }, [areaQuery, areaOpen, regionId])

  useEffect(() => {
    if (!areaOpen || !areaListRef.current) return
    areaListRef.current.querySelector('[data-active="true"]')?.scrollIntoView({block: 'nearest'})
  }, [activeIndex, areaOpen])

  function pickArea(d: BazarakiDistrict) {
    const cms = toCmsLocationFields(d)
    onChange({
      district: cms.district,
      city: cms.city,
      area: cms.area,
      bazarakiDistrictId: cms.bazarakiDistrictId,
      postalCode: d.postCodes[0] != null ? String(d.postCodes[0]) : undefined,
    })
    setAreaQuery(d.areaName)
    setAreaOpen(false)
  }

  function onRegionChange(nextRegionId: string) {
    const id = nextRegionId ? Number(nextRegionId) : null
    setRegionId(id)
    const region = getBazarakiRegionById(id)
    const nextCity = resolveCityForRegion(id)
    setAreaQuery('')
    onChange({
      district: region?.name ?? '',
      city: nextCity,
      area: '',
      bazarakiDistrictId: null,
    })
  }

  function clearArea() {
    setAreaQuery('')
    setAreaOpen(false)
    onChange({
      district: getBazarakiRegionById(regionId)?.name ?? value.district,
      city: cityName,
      area: '',
      bazarakiDistrictId: null,
    })
    areaInputRef.current?.focus()
  }

  function onAreaKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!areaOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault()
      if (regionId != null) setAreaOpen(true)
      return
    }
    if (!areaOpen) return

    if (e.key === 'Escape') {
      e.preventDefault()
      setAreaOpen(false)
      if (selectedArea) setAreaQuery(selectedArea.areaName)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, areaResults.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter' && areaResults[activeIndex]) {
      e.preventDefault()
      pickArea(areaResults[activeIndex])
    }
  }

  const areaListId = 'bazaraki-area-list'
  const regionLabel = getBazarakiRegionById(regionId)?.name
  const areaCountLabel =
    regionId != null ? `${areas.length} areas in ${regionLabel ?? 'district'}` : 'Select a district first'

  return (
    <div className="admin-location-picker">
      <div className="admin-form__grid">
        <div className="admin-field">
          <label htmlFor="cms-location-district">District</label>
          <select
            id="cms-location-district"
            value={regionId ?? ''}
            onChange={(e) => onRegionChange(e.target.value)}
          >
            <option value="">Select district</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-field admin-district-picker">
          <label htmlFor="cms-location-area">Area</label>
          <div
            className={`admin-district-picker__combobox${areaOpen ? ' is-open' : ''}${value.bazarakiDistrictId != null ? ' has-value' : ''}`}
            ref={areaWrapRef}
          >
            <div className="admin-district-picker__input-wrap">
              <Search className="admin-district-picker__icon admin-district-picker__icon--search" aria-hidden />
              <input
                id="cms-location-area"
                ref={areaInputRef}
                value={areaQuery}
                onChange={(e) => {
                  setAreaQuery(e.target.value)
                  setAreaOpen(true)
                  if (!e.target.value.trim()) {
                    onChange({
                      district: getBazarakiRegionById(regionId)?.name ?? value.district,
                      city: cityName,
                      area: '',
                      bazarakiDistrictId: null,
                    })
                  }
                }}
                onFocus={() => {
                  if (regionId != null) setAreaOpen(true)
                }}
                onKeyDown={onAreaKeyDown}
                placeholder={
                  regionId == null ? 'Select district first…' : 'Search area or neighbourhood…'
                }
                autoComplete="off"
                role="combobox"
                aria-expanded={areaOpen}
                aria-controls={areaListId}
                aria-autocomplete="list"
                disabled={regionId == null}
              />
              <button
                type="button"
                className="admin-district-picker__toggle"
                disabled={regionId == null}
                onMouseDown={(e) => {
                  e.preventDefault()
                  if (areaOpen) setAreaOpen(false)
                  else if (regionId != null) setAreaOpen(true)
                }}
                aria-label={areaOpen ? 'Close area list' : 'Open area list'}
              >
                <ChevronDown aria-hidden />
              </button>
              {value.bazarakiDistrictId != null ? (
                <button
                  type="button"
                  className="admin-district-picker__clear"
                  onClick={clearArea}
                  aria-label="Clear area"
                >
                  <X aria-hidden />
                </button>
              ) : null}
            </div>

            {areaOpen ? (
              <div className="admin-district-picker__panel">
                <div className="admin-district-picker__panel-head">
                  <MapPin aria-hidden />
                  <span>
                    {areaQuery.trim()
                      ? `${areaResults.length} match${areaResults.length === 1 ? '' : 'es'}`
                      : areaCountLabel}
                  </span>
                </div>

                {areaResults.length > 0 ? (
                  <ul className="admin-district-picker__list" id={areaListId} role="listbox" ref={areaListRef}>
                    {areaResults.map((d, index) => {
                      const isSelected = value.bazarakiDistrictId === d.id
                      const isActive = index === activeIndex
                      return (
                        <li key={d.id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            data-active={isActive ? 'true' : undefined}
                            className={isSelected ? 'is-selected' : undefined}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => pickArea(d)}
                          >
                            <span className="admin-district-picker__item-main">
                              <strong>{d.areaName}</strong>
                              <span className="admin-district-picker__city">{d.regionName}</span>
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
                  <p className="admin-district-picker__empty">
                    No areas match &ldquo;{areaQuery}&rdquo;
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {value.bazarakiDistrictId != null && selectedArea ? (
        <p className="admin-location-picker__meta">
          <span>Bazaraki location</span>
          <strong>
            {selectedArea.regionName} · {selectedArea.areaName}
          </strong>
          <span className="admin-district-picker__meta-value">ID {value.bazarakiDistrictId}</span>
        </p>
      ) : (
        <p className="admin-location-picker__hint">
          Districts and areas are synced from Bazaraki ({getBazarakiRegions().length} districts,{' '}
          {areas.length > 0 ? `${areas.length} areas in ${regionLabel}` : '549 areas across Cyprus'}).
        </p>
      )}
    </div>
  )
}

export {formatAreaName, formatDistrictLabel}
