function CategoryFilters({
  categories,
  activeCategory,
  onSelect,
  onReset,
  categoryLabel = 'Listing type',
  clearLabel = 'Clear all',
}) {
  return (
    <div className="search-panel__filter-block search-panel__filter-block--sidebar search-panel__filter-block--categories">
      <div className="search-panel__filter-toolbar">
        <p className="search-panel__filter-label" id="search-panel-category-label">
          {categoryLabel}
        </p>
        <button type="button" className="search-panel__reset search-panel__reset--alt" onClick={onReset}>
          {clearLabel}
        </button>
      </div>
      <div
        className="search-panel__chip-row search-panel__chip-row--categories"
        role="group"
        aria-labelledby="search-panel-category-label"
      >
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
    </div>
  )
}

export default CategoryFilters
