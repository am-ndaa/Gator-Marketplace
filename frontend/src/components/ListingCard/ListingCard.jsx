import './ListingCard.css'
import logo from '../../assets/logo.svg'

export default function ListingCard({ listing, index }) {
  const isEven = index % 2 === 0
  const cardClass = isEven ? 'listing-card even' : 'listing-card odd'
//selectedListing.image_url
  return (
    <div className={cardClass}>
      <div className="card-image">
        <img src={listing.image_url} alt={listing.title} />
        <p className="price">${listing.price}</p>
      </div>
      <div className="card-content">
        <h3>{listing.title}</h3>
        <p className="description">{listing.description}</p>
      </div>
    </div>
  )
}
