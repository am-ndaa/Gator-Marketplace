import './FilterPanel.css'

export default function FilterPanel() {
  return (
    <div className="filter-panel">
      {[...Array(5)].map((_, i) => (
        <button className="filter-circle" key={i} />
      ))}
    </div>
  )
}
