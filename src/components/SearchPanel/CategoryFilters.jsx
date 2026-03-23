function CategoryFilters({ categories, activeCategory, onSelect, onReset }) {
  return (
    <div className="search-panel__controls-row">
      <div className="search-panel__chip-row search-panel__chip-row--categories" aria-label="Category filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`search-panel__chip search-panel__chip--category ${
              activeCategory === category ? 'is-active' : ''
            }`}
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <button type="button" className="search-panel__reset search-panel__reset--alt" onClick={onReset}>
        Clear All
      </button>
    </div>
  )
}

export default CategoryFilters
