import React, { useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import * as api from '../../api/listings'
import { useNavigate } from 'react-router-dom'
import useUserProfile from '../../hooks/useUserProfile'
import './Navbar.css'
import logo from '../../assets/logo.svg'
import searchimg from '../../assets/search.svg'

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { logout, user } = useAuth0();
  const { userProfile } = useUserProfile()
  const navigate = useNavigate()
  const handleProfileClick = () => setDropdownOpen((open) => !open)

  const { getAccessTokenSilently } = useAuth0();

  const handleRefreshListings = async (e) => {
    e?.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const data = await api.listListings({}, token);
      console.log('Fetched listings', data);
    } catch (err) {
      console.error('Failed to fetch listings', err);
    }
  }

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Gator Marketplace"/>
      </div>

      <form className="navbar-search">
        <input
          type="text"
          placeholder="Search..."
          className="navbar-search-input"
        />
        <button type="submit" className="navbar-search-btn">
          <img src={searchimg}/>
        </button>
      </form>
  
      <div className="navbar-profile">
        <img
          src={userProfile?.profile_picture_url || user?.picture || logo}
          className="navbar-profile-img"
          alt="Profile"
          onClick={handleProfileClick}
        />
        {dropdownOpen && (
          <div className="navbar-dropdown">
            <button onClick={() => navigate('/profile')}>Profile</button>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
          </div>
        )}
      </div>
    </div>
  )
}
