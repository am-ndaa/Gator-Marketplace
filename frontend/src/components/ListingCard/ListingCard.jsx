import './ListingCard.css'
import logo from '../../assets/logo.svg'

export default function ListingCard({ listing, index }) {
  const isEven = index % 2 === 0
  const cardClass = isEven ? 'listing-card even' : 'listing-card odd'

  return (
    <div className={cardClass}>
      <div className="card-image">
        <img src={listing.image || logo } alt={listing.title} />
      </div>
      <div className="card-content">
        <h3>{listing.title}</h3>
        <p className="price">${listing.price}</p>
        <p className="description">{listing.description}</p>
      </div>
    </div>
  )
}
