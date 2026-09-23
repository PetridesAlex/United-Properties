import {BEDROOM_OPTIONS} from '../../lib/search/searchPath'

function BedroomFilters({
  value = 0,
  onSelect,
  label = 'Bedrooms',
}) {
  return (
    <div className="search-panel__filter-block">
      <p className="search-panel__filter-label" id="search-page-beds-label">
        {label}
      </p>
      <div
        className="search-panel__chip-row"
        role="group"
        aria-labelledby="search-page-beds-label"
      >
        {BEDROOM_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`search-panel__chip ${value === option.value ? 'is-active' : ''}`}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default BedroomFilters
