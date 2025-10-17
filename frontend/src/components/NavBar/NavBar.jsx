import React, { useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom'
import './Navbar.css'
import logo from '../../assets/logo.svg'
import searchimg from '../../assets/search.svg'

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { logout } = useAuth0();
  const { user } = useAuth0();
  const navigate = useNavigate()
  const handleProfileClick = () => setDropdownOpen((open) => !open)

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
          src={user?.picture || logo}
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
