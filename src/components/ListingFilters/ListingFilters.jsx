import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { TYPE_OPTIONS, areaOf, cityOf, typeGroup, uniqueSorted } from '../../lib/search/listingFilters'
import './ListingFilters.css'

const LISTING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'For Sale', label: 'For sale' },
  { value: 'For Rent', label: 'For rent' },
]

const ANY = (list) => [{ value: '', label: 'Any' }, ...list.map((v) => ({ value: v, label: v }))]

function Pills({ label, value, options, onPick }) {
  return (
    <div className="lf__group">
      <div className="lf__label">{label}</div>
      <div className="lf__pills" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value || 'any'}
            type="button"
            className={`lf__pill${value === o.value ? ' is-on' : ''}`}
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Select({ label, value, options, onPick, anyLabel }) {
  return (
    <div className="lf__group">
      <div className="lf__label">{label}</div>
      <label className="lf__select">
        <select value={value} onChange={(e) => onPick(e.target.value)} aria-label={label}>
          <option value="">{anyLabel}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden />
      </label>
    </div>
  )
}


function Combo({ label, value, options, onPick, anyLabel }) {
  const [text, setText] = useState(value)
  const [open, setOpen] = useState(false)
  useEffect(() => setText(value), [value])
  const q = text.trim().toLowerCase()
  const shown = q && q !== value.toLowerCase() ? options.filter((o) => o.toLowerCase().includes(q)) : options
  const mark = (o) => {
    const i = q ? o.toLowerCase().indexOf(q) : -1
    if (i < 0 || q === value.toLowerCase()) return o
    return (
      <>
        {o.slice(0, i)}
        <b>{o.slice(i, i + q.length)}</b>
        {o.slice(i + q.length)}
      </>
    )
  }
  return (
    <div className="lf__group">
      <div className="lf__label">{label}</div>
      <div className="lf__combo">
        <input
          value={text}
          placeholder={anyLabel}
          aria-label={label}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setText(e.target.value)
            setOpen(true)
          }}
          onBlur={() =>
            window.setTimeout(() => {
              setOpen(false)
              setText(value)
            }, 150)
          }
        />
        <ChevronDown size={16} aria-hidden />
        {open ? (
          <ul className="lf__opts">
            <li>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(''); setOpen(false) }}>
                {anyLabel}
              </button>
            </li>
            {shown.map((o) => (
              <li key={o}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(o); setOpen(false) }}>
                  {mark(o)}
                </button>
              </li>
            ))}
            {!shown.length ? <li className="lf__none">No match</li> : null}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function Range({ label, minValue, maxValue, onMin, onMax, minHolder = 'No min', maxHolder = 'No max' }) {
  return (
    <div className="lf__group">
      <div className="lf__label">{label}</div>
      <div className="lf__range">
        <label className="lf__field">
          <small>MIN</small>
          <input
            inputMode="numeric"
            value={minValue}
            placeholder={minHolder}
            onChange={(e) => onMin(e.target.value.replace(/[^\d]/g, ''))}
          />
        </label>
        <i aria-hidden />
        <label className="lf__field">
          <small>MAX</small>
          <input
            inputMode="numeric"
            value={maxValue}
            placeholder={maxHolder}
            onChange={(e) => onMax(e.target.value.replace(/[^\d]/g, ''))}
          />
        </label>
      </div>
    </div>
  )
}

/** The same questions as the Search page, laid out horizontally (Buy, Rent). */
function ListingFilters({ filters, onChange, onClear, pool, count, id = 'lf', variant = 'bar' }) {
  const [sheet, setSheet] = useState(false)

  const cities = useMemo(() => uniqueSorted(pool.map(cityOf)), [pool])
  const areas = useMemo(
    () =>
      uniqueSorted(
        pool.filter((p) => !filters.city || cityOf(p) === filters.city).map(areaOf),
      ),
    [pool, filters.city],
  )

  useEffect(() => {
    document.body.style.overflow = sheet ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheet])

  const type = filters.type
  const showHome = type === 'apartments' || type === 'houses'
  const showOffice = type === 'offices'
  const showLand = type === 'land'
  const conditionList = ['Brand new', 'Resale']
  if (filters.listing !== 'For Rent' && !showLand) conditionList.push('Under construction')

  const box = variant === 'box'
  const Pick = box ? Combo : Select
  const set = (key) => (value) => onChange({ [key]: value })

  const search = (
    <label className="lf__search">
      <Search size={19} strokeWidth={1.6} aria-hidden />
      <input
        value={filters.keyword}
        onChange={(e) => onChange({ keyword: e.target.value })}
        placeholder="Keyword or reference number"
        aria-label="Keyword or reference number"
      />
    </label>
  )

  const listing = (
    <Pills label="LISTING" value={filters.listing} options={LISTING_OPTIONS} onPick={set('listing')} />
  )

  const general = (
    <>
      <Pills label="PROPERTY TYPE" value={type} options={TYPE_OPTIONS} onPick={set('type')} />
      <Pick label="CITY" value={filters.city} options={cities} onPick={(v) => onChange({ city: v, area: '' })} anyLabel="All cities" />
      <Pick label="AREA" value={filters.area} options={areas} onPick={set('area')} anyLabel="All areas" />
      <Range
        label="PRICE (EUR)"
        minValue={filters.minPrice}
        maxValue={filters.maxPrice}
        onMin={set('minPrice')}
        onMax={set('maxPrice')}
      />
    </>
  )

  const specific = (
    <>
      {showHome ? (
        <>
          <Pills label="BEDROOMS" value={filters.bedrooms} options={[{ value: '', label: 'Any' }, { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' }, { value: '4', label: '4+' }]} onPick={set('bedrooms')} />
          <Pills label="BATHROOMS" value={filters.bathrooms} options={[{ value: '', label: 'Any' }, { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' }]} onPick={set('bathrooms')} />
        </>
      ) : null}
      {showOffice ? (
        <Pills label="FLOOR" value={filters.floor} options={ANY(['Ground', '1', '2', '3', '4+'])} onPick={set('floor')} />
      ) : null}
      {showHome || showOffice ? (
        <Pills
          label="FURNISHING"
          value={filters.furnishing}
          options={ANY(showOffice ? ['Unfurnished', 'Furnished'] : ['Unfurnished', 'Semi', 'Furnished'])}
          onPick={set('furnishing')}
        />
      ) : null}
      {showHome || showOffice ? (
        <Pills label="CONDITION" value={filters.condition} options={ANY(conditionList)} onPick={set('condition')} />
      ) : null}
      {showOffice ? (
        <Pills label="AIR CONDITIONING" value={filters.airConditioning} options={ANY(['Yes'])} onPick={set('airConditioning')} />
      ) : null}
      {showLand ? (
        <>
          <Pills label="LAND USE" value={filters.landUse} options={ANY(['Residential', 'Commercial', 'Agricultural'])} onPick={set('landUse')} />
          <Range label="PLOT AREA (SQM)" minValue={filters.minPlot} maxValue={filters.maxPlot} onMin={set('minPlot')} onMax={set('maxPlot')} />
        </>
      ) : null}
    </>
  )

  const showLabel = `Show ${count} ${count === 1 ? 'property' : 'properties'}`

  const sheetEl = (
    <>
      {sheet ? (
        <div className="lf__sheet" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="lf__sheet-head">
            <span>FILTERS</span>
            <button type="button" className="lf__clear" onClick={onClear}>Clear all</button>
            <button type="button" className="lf__x" onClick={() => setSheet(false)} aria-label="Close filters">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="lf__sheet-body">
            {listing}
            {general}
            {specific}
          </div>
          <div className="lf__sheet-foot">
            <button type="button" className="lf__show" onClick={() => setSheet(false)}>
              {showLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )

  if (box) {
    return (
      <div className="lf lf--box" id={id}>
        <div className="lf__r1 lf__only-phone">
          {search}
          <button type="button" className="lf__open" onClick={() => setSheet(true)}>
            <SlidersHorizontal size={17} strokeWidth={1.6} aria-hidden /> Filters
          </button>
        </div>
        <div className="lf__boxbody lf__wide">
          <div className="lf__boxhead">
            <span>FILTERS</span>
            <button type="button" className="lf__clear" onClick={onClear}>Clear all</button>
          </div>
          {search}
          {listing}
          {general}
          {specific}
        </div>
        {sheetEl}
      </div>
    )
  }

  return (
    <div className="lf" id={id}>
      <div className="lf__r1">
        {search}
        <div className="lf__wide">{listing}</div>
        <button type="button" className="lf__clear lf__wide" onClick={onClear}>
          Clear all
        </button>
        <button type="button" className="lf__open" onClick={() => setSheet(true)}>
          <SlidersHorizontal size={17} strokeWidth={1.6} aria-hidden /> Filters
        </button>
      </div>
      <div className="lf__r2 lf__wide">{general}</div>
      {specific.props.children.some(Boolean) ? <div className="lf__r3 lf__wide">{specific}</div> : null}
      {sheetEl}
    </div>
  )
}

export { typeGroup }
export default ListingFilters
