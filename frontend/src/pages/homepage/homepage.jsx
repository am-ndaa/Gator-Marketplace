import NavBar from "../../components/NavBar/NavBar";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import ListingGrid from "../../components/ListingGrid/ListingGrid";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as api from '../../api/listings'
import logo from '../../assets/logo.svg'

import './homepage.css'

export default function Home() {

  const { isAuthenticated, user, logout, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [listError, setListError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('')
  const [openModal, setOpenModal] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null); // TODO for viewing listing details

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!user.email.endsWith('@ufl.edu')) {
        logout({
          logoutParams: {
            federated: true,
            returnTo: window.location.origin,
          },
        });
        navigate('/');
      }
    }
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user, logout, navigate]);

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoadingListings(true)
      setListError(null)
      try {
        console.time("Auth0 getToken");
        let token = null
        try {
          token = null
        } catch {
          token = null
        }
        console.timeEnd("Auth0 getToken");

        console.time("API call");
        const params = {}
        if (searchQuery) params.q = searchQuery
        if (selectedFilter) params.filter = selectedFilter
        const res = await api.listListings(params, token)
        console.timeEnd("API call");

        if (!mounted) return
        setListings(res.items || [])
      } catch (err) {
        console.error('Failed to load listings', err)
        setListError(err)
      } finally {
        setLoadingListings(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [searchQuery, selectedFilter])

  return (
    <>
      <NavBar onSearch={setSearchQuery} />
      <FilterPanel onFilterChange={setSelectedFilter} selectedFilter={selectedFilter} />
      <div className="main-content">
        {loadingListings ? (
          <p>Loading listings...</p>
        ) : listError ? (
          <p style={{ color: 'red' }}>Failed to load listings</p>
        ) : (
          <ListingGrid
            listings={listings}
            onListingClick={listing => {
              setSelectedListing(listing);
              setOpenModal('view');
            }}
          />
        )}
      </div>
      <button
        className="new-listing-button"
        onClick={() => setOpenModal('create')}
      >
        +
      </button>
      {openModal === 'create' && (
        <div className="modal-overlay" onClick={() => setOpenModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create New Listing</h2>
            <button onClick={() => setOpenModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {openModal === 'view' && selectedListing && (
        <div className="modal-overlay" onClick={() => setOpenModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedListing.title}</h2>
            <img src={selectedListing.image_url} alt={selectedListing.title} />
            <p>{selectedListing.description}</p>
            <p>Price: ${selectedListing.price}</p>
            <p>Category: {selectedListing.category}</p>
            <p>Seller ID: {selectedListing.seller_id}</p> {/*Need to figure out how to track seller id to seller email or name, probably need to make the sellerid when creating a listing the auth0 id and then in this field call the email through that id*/}
            <p>
              Listing created:{" "}
              {new Date(selectedListing.created_at).toLocaleString("en-US", {
                month: "short",   // e.g., Oct
                day: "numeric",   // e.g., 20
                hour: "numeric",
                minute: "2-digit",
                hour12: true      // 12-hour format with am/pm
              })}
            </p>

            <button onClick={() => setOpenModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
