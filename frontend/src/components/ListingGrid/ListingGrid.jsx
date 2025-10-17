import ListingCard from '../ListingCard/ListingCard'
import './ListingGrid.css'

export default function ListingGrid({ listings }) {
  return (
    <div className="listing-grid">
      {listings.map((listing, index) => (
        <ListingCard 
          key={listing.id || index} 
          listing={listing} 
          index={index} 
        />
      ))}
    </div>
  )
}
