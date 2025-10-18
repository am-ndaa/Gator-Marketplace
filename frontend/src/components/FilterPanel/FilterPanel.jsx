import './FilterPanel.css'

export default function FilterPanel({ onFilterChange, selectedFilter }) {
  const categories = ['dorm', 'school supplies', 'clothing', 'textbooks', 'electronics']
  
  return (
    <div className="filter-panel">
      <button 
        className={`filter-circle ${!selectedFilter ? 'active' : ''}`}
        onClick={() => onFilterChange?.('')}
      >
        All
      </button>
      {categories.map((category) => (
        <button 
          className={`filter-circle ${selectedFilter === category ? 'active' : ''}`}
          key={category}
          onClick={() => onFilterChange?.(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
