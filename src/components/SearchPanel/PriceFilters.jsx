import {pricePresetsForCategory} from '../../lib/search/searchPath'

function PriceFilters({
  category = 'All Listings',
  minPrice = 0,
  maxPrice = 0,
  onMinChange,
  onMaxChange,
  label = 'Price',
  minLabel = 'Minimum',
  maxLabel = 'Maximum',
}) {
  const presets = pricePresetsForCategory(category)

  return (
    <div className="search-panel__filter-block search-panel__filter-block--price">
      <p className="search-panel__filter-label" id="search-page-price-label">
        {label}
      </p>
      <div className="search-page__price-grid" role="group" aria-labelledby="search-page-price-label">
        <label className="search-page__price-field">
          <span className="search-page__price-caption">{minLabel}</span>
          <select
            value={minPrice || 0}
            onChange={(event) => onMinChange(Number(event.target.value) || 0)}
            aria-label={minLabel}
          >
            {presets.min.map((option) => (
              <option key={`min-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="search-page__price-field">
          <span className="search-page__price-caption">{maxLabel}</span>
          <select
            value={maxPrice || 0}
            onChange={(event) => onMaxChange(Number(event.target.value) || 0)}
            aria-label={maxLabel}
          >
            {presets.max.map((option) => (
              <option key={`max-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default PriceFilters
