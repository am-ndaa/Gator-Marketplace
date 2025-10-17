import NavBar from "../../components/NavBar/NavBar";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import ListingGrid from "../../components/ListingGrid/ListingGrid";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import './homepage.css'

export default function Home() {

const { isAuthenticated, user, logout, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!user.email.endsWith('@ufl.edu')) {
        logout({ logoutParams: { returnTo: window.location.origin } });
        navigate('/');
      }
    }
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user, logout, navigate]);

  const mockListings = [
    { id: 1, title: "iPhone 13", price: 500, description: "Idk this is a description", image: null },
    { id: 2, title: "MacBook Pro", price: 1200, description: "Description", image: null },
    { id: 3, title: "Desk Chair", price: 80, description: "Comfortable office chair", image: null },
    { id: 4, title: "iPhone 13", price: 500, description: "Great condition", image: null },
    { id: 5, title: "MacBook Pro", price: 1200, description: "Like new", image: null },
    { id: 6, title: "Desk Chair", price: 80, description: "Comfortable office chair", image: null },
    
  ]

  return (
    <>
      <NavBar />
      <FilterPanel />
      <div className="main-content">
        <ListingGrid listings={mockListings} />
      </div>
    </>
  )
}
