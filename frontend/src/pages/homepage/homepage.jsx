import NavBar from "../../components/NavBar/NavBar";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import ListingGrid from "../../components/ListingGrid/ListingGrid";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as api from '../../api/listings'

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

  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });
  const [modalError, setModalError] = useState(null);

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

  async function handleCreateListing(e) {
    e.preventDefault();
    setModalError(null);
    try {
      const token = null; // Skip auth for now
      const seller_id = user?.sub; // Auth0 ID
      const listingData = {
        ...newListing,
        price: Number(newListing.price),
        seller_id
      };
      await api.createListing(listingData, token); // uses Auth0 token for authentication
      setOpenModal(null);
      setNewListing({
        title: '',
        description: '',
        price: '',
        category: '',
        image_url: ''
      });
      // Refresh listings after creation
      const params = {}
      if (searchQuery) params.q = searchQuery
      if (selectedFilter) params.filter = selectedFilter
      const res = await api.listListings(params, null);
      setListings(res.items || []);
      setLoadingListings(false);
    } catch (err) {
      // Show proper error message if object returned
      setModalError(
        typeof err.body === 'string'
          ? err.body
          : err.body?.errors
            ? JSON.stringify(err.body.errors)
            : JSON.stringify(err.body)
      );
    }
  }

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
            <form onSubmit={handleCreateListing} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                placeholder="Title"
                value={newListing.title}
                onChange={e => setNewListing(l => ({ ...l, title: e.target.value }))}
                required
              />
              <textarea
                placeholder="Description"
                value={newListing.description}
                onChange={e => setNewListing(l => ({ ...l, description: e.target.value }))}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newListing.price}
                onChange={e => setNewListing(l => ({ ...l, price: e.target.value }))}
                min={0}
                step="0.01"
                required
              />
              <select
                value={newListing.category}
                onChange={e => setNewListing(l => ({ ...l, category: e.target.value }))}
                required
              >
                <option value="">Select Category</option>
                <option value="dorm">Dorm</option>
                <option value="school supplies">School Supplies</option>
                <option value="clothing">Clothing</option>
                <option value="textbooks">Textbooks</option>
                <option value="electronics">Electronics</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = () => setNewListing(l => ({ ...l, image_url: reader.result }))
                    reader.readAsDataURL(file)
                  }
                }}
              />
              {modalError && (
                <p style={{ color: 'red' }}>
                  {modalError}
                </p>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit">Create</button>
                <button type="button" onClick={() => setOpenModal(null)}>Cancel</button>
              </div>
            </form>
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
            <p>Price: {selectedListing.price}</p>
            <p>Seller ID: {selectedListing.seller_id}</p> {/*Need to figure out how to track seller id to seller email or name, probably need to make the sellerid when creating a listing the auth0 id and then in this field call the email through that id*/}
            <p>Listing created: {selectedListing.created_at}</p> {/*Need to fix format so it onyl shows day? Maybe time? but pretty*/}

            <button onClick={() => setOpenModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
