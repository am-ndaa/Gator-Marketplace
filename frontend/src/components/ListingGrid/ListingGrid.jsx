import ListingCard from '../ListingCard/ListingCard'
import './ListingGrid.css'

export default function ListingGrid({ listings, onListingClick }) {
  return (
    <div className="listing-grid">
      {listings.map((listing, index) => (
        <div
          key={listing.id || index}
          onClick={() => onListingClick && onListingClick(listing)}
          style={{ cursor: 'pointer' }}
        >
          <ListingCard listing={listing} index={index} />
        </div>
      ))}
    </div>
  )
}
