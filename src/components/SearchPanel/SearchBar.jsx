import { Search } from 'lucide-react'

function SearchBar({
  value,
  onChange,
  placeholder = 'Search properties, locations, featured...',
}) {
  return (
    <div className="search-panel__searchbar">
      <span className="search-panel__searchbar-icon" aria-hidden="true">
        <Search size={18} strokeWidth={2.25} />
      </span>
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search properties and locations"
        autoComplete="off"
      />
    </div>
  )
}

export default SearchBar
