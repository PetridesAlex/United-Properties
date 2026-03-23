import { Search } from 'lucide-react'

function SearchBar({ value, onChange }) {
  return (
    <div className="search-panel__searchbar">
      <Search size={18} />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search properties, locations, developments..."
      />
    </div>
  )
}

export default SearchBar
