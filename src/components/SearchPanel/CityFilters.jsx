function CityFilters({ cities, activeCity, onSelect }) {
  return (
    <div className="search-panel__chip-row search-panel__chip-row--cities" aria-label="City filters">
      {cities.map((city) => (
        <button
          key={city}
          type="button"
          className={`search-panel__chip search-panel__chip--city ${activeCity === city ? 'is-active' : ''}`}
          onClick={() => onSelect(city)}
        >
          {city}
        </button>
      ))}
    </div>
  )
}

export default CityFilters
