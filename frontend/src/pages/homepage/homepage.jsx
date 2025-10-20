import NavBar from "../../components/NavBar/NavBar";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import ListingGrid from "../../components/ListingGrid/ListingGrid";
import SellerEmail from "../../components/SellerEmail";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as api from '../../api/listings'

import './homepage.css'

export default function Home() {

  const { isAuthenticated, user, logout, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [listError, setListError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listingImages, setListingImages] = useState({})
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
        const res = await api.listListings({...params, page: 1}, token)
        console.timeEnd("API call");

        if (!mounted) return
        setListings(res.items || [])
        setHasMore(res.has_more || false)
        setCurrentPage(1)
        // Load images for visible listings
        loadImagesForListings(res.items || [])
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

  async function loadImagesForListings(listingsToLoad) {
    for (const listing of listingsToLoad) {
      if (!listingImages[listing.id]) {
        try {
          const fullListing = await api.getListing(listing.id, null)
          setListingImages(prev => ({...prev, [listing.id]: fullListing.image_url}))
        } catch (err) {
          console.error('Failed to load image for listing:', listing.id)
        }
      }
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const params = {}
      if (searchQuery) params.q = searchQuery
      if (selectedFilter) params.filter = selectedFilter
      const res = await api.listListings({...params, page: currentPage + 1}, null)
      
      setListings(prev => [...prev, ...res.items])
      setHasMore(res.has_more || false)
      setCurrentPage(prev => prev + 1)
      loadImagesForListings(res.items)
    } catch (err) {
      console.error('Failed to load more listings', err)
    } finally {
      setLoadingMore(false)
    }
  }

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
      const res = await api.listListings({...params, page: 1}, null);
      setListings(res.items || []);
      setHasMore(res.has_more || false)
      setCurrentPage(1)
      loadImagesForListings(res.items || [])
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
          <>
            <ListingGrid
              listings={listings.map(listing => ({...listing, image_url: listingImages[listing.id]}))}
              onListingClick={async (listing) => {
                try {
                  const fullListing = await api.getListing(listing.id, null)
                  setSelectedListing(fullListing)
                  setOpenModal('view')
                } catch (err) {
                  console.error('Failed to load full listing:', err)
                  setSelectedListing(listing)
                  setOpenModal('view')
                }
              }}
            />
            {hasMore && (
              <div style={{ textAlign: 'center', margin: '20px' }}>
                <button 
                  onClick={loadMore} 
                  disabled={loadingMore}
                  style={{ padding: '10px 20px', fontSize: '16px' }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
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
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0]
                    if (file) {
                      // Check file size (limit to 2MB)
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Please choose an image smaller than 2MB')
                        e.target.value = ''
                        return
                      }
                      
                      const canvas = document.createElement('canvas')
                      const ctx = canvas.getContext('2d')
                      const img = new Image()
                      
                      img.onload = () => {
                        // Moderate compression: 600px max width, 60% quality
                        const maxWidth = 600
                        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
                        canvas.width = img.width * ratio
                        canvas.height = img.height * ratio
                        
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6)
                        setNewListing(l => ({ ...l, image_url: compressedDataUrl }))
                      }
                      
                      const reader = new FileReader()
                      reader.onload = () => { img.src = reader.result }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Tip: Use smaller images (under 2MB) for faster loading.
                </small>
              </div>
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px", padding: "20px" }}>
            <h2 style={{ marginBottom: "15px" }}>{selectedListing.title}</h2>
            <img 
              src={selectedListing.image_url} 
              alt={selectedListing.title}
              style={{ maxWidth: '100%', height: 'auto', marginBottom: '15px' }}
            />
            <div style={{ textAlign: "left", lineHeight: "1.6" }}>
              <p>{selectedListing.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Price:</span>
                <span>${Number(selectedListing.price).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Category:</span>
                <span>{selectedListing.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Seller:</span>
                <span><SellerEmail sellerId={selectedListing.seller_id} /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Listed:</span>
                <span>{new Date(selectedListing.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                })}</span>
              </div>
            </div>
            <button onClick={() => setOpenModal(null)} style={{ marginTop: "20px", padding: "10px 20px" }}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
