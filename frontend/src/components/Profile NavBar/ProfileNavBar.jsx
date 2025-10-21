import React, { useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import * as api from '../../api/listings'
import { useNavigate } from 'react-router-dom'
import useUserProfile from '../../hooks/useUserProfile'
import './ProfileNavBar.css'
import logo from '../../assets/logo.svg'

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { logout, user } = useAuth0();
  const { userProfile } = useUserProfile()
  const navigate = useNavigate()

  const handleProfileClick = () => setDropdownOpen((open) => !open)

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Gator Marketplace" />
      </div>

      <div className="navbar-profile">
        <img
          src={userProfile?.profile_picture_url || user?.picture || logo}
          className="navbar-profile-img"
          alt="Profile"
          onClick={handleProfileClick}
        />
        {dropdownOpen && (
          <div className="navbar-dropdown">
            <button onClick={() => navigate('/homepage')}>Homepage</button>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
          </div>
        )}
      </div>
    </div>
  )
}
