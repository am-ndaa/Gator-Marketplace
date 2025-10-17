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
          token = await getAccessTokenSilently()
        } catch {
          token = null
        }
        console.timeEnd("Auth0 getToken");

        console.time("API call");
        const res = await api.listListings({}, token)
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
  }, [getAccessTokenSilently])

  return (
    <>
      <NavBar />
      <FilterPanel />
      <div className="main-content">
        {loadingListings ? (
          <p>Loading listings...</p>
        ) : listError ? (
          <p style={{ color: 'red' }}>Failed to load listings</p>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </div>
    </>
  )
}
