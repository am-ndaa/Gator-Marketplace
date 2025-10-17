// src/pages/Profile.jsx
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./profile.css";
import NavBar from "../../components/NavBar/NavBar";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  // Split the Auth0 name field into first and last names
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
  if (user?.name) {
    // Example: "Seguinot, Ilani M."
    const parts = user.name.split(","); // ["Seguinot", " Ilani M."]
    if (parts.length === 2) {
      const last = parts[0].trim(); // "Seguinot"
      const firstPart = parts[1].trim().split(" "); // ["Ilani", "M."]
      const first = firstPart[0]; // "Ilani"
      setFirstName(first);
      setLastName(last);
    } else {
      // fallback if name doesn't contain a comma
      const [first, ...rest] = user.name.split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
    }
  }
}, [user]);

  if (isLoading) return <div>Loading...</div>;

  return (
    isAuthenticated && (
      <>
      <NavBar />
      <div className="profile-container">
        {/* Left side: profile picture */}
        <div className="profile-left">
          <img src={user.picture} alt={user.name} className="profile-picture" />
        </div>

        {/* Right side: user info */}
        <div className="profile-right">
          <h1 className="profile-name">{firstName}{" "}{lastName}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-bio">
            <p>Member since: {new Date().getFullYear()}</p>
          </p>

          {/* Button back to homepage */}
          <button
            className="profile-button"
            onClick={() => (window.location.href = "/homepage")}
          >
            Back to Homepage
          </button>
        </div>
      </div>
      </>
    )
  );
}