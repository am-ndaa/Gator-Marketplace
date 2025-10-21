import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { updateUserProfile } from "../../api/users"; 
import "./profile.css";
import NavBarP from "../../components/Profile NavBar/ProfileNavBar";
import { useUserProfile } from '../../contexts/UserProfileContext';

export default function Profile() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { userProfile, updateProfile } = useUserProfile();
  const [profilePic, setProfilePic] = useState(user?.picture);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(",");
      if (parts.length === 2) {
        setLastName(parts[0].trim());
        setFirstName(parts[1].trim().split(" ")[0]);
      } else {
        const [first, ...rest] = user.name.split(" ");
        setFirstName(first);
        setLastName(rest.join(" "));
      }
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        // Compress to 600px max width, 70% quality
        const maxWidth = 600;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        setProfilePic(compressedDataUrl);
        
        try {
          const token = await getAccessTokenSilently();
          const updatedUser = await updateUserProfile(user.sub, { profile_picture_url: compressedDataUrl }, token);
          
          if (updatedUser?.profile_picture_url) {
            setProfilePic(updatedUser.profile_picture_url);
            updateProfile({ profile_picture_url: updatedUser.profile_picture_url });
          }
        } catch (err) {
          console.error("Error uploading profile picture:", err);
          alert("Error updating profile picture.");
        } finally {
          setUploading(false);
        }
      };
      
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result; };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error processing image:", err);
      alert("Error processing image.");
      setUploading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    isAuthenticated && (
      <>
        <NavBarP />
        <div className="profile-container">
          <div className="profile-content">
            <h1 className="profile-title">My Profile</h1>
            <div className="profile-box">
              {/* LEFT SIDE — profile picture + upload button */}
              <div className="profile-left" style={{ flexDirection: "column" }}>
                <img
                  src={userProfile?.profile_picture_url || profilePic}
                  alt={user.name}
                  className="profile-picture"
                />

                <label
                  htmlFor="fileUpload"
                  className="profile-button"
                  style={{
                    marginTop: "1rem",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  {uploading ? "Uploading..." : "Change Picture"}
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* RIGHT SIDE — user info */}
              <div className="profile-right">
                <h1 className="profile-name">
                  {firstName} {lastName}
                </h1>
                <p className="profile-email">{user.email}</p>
                <p className="profile-bio">
                  Member since: {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
}
