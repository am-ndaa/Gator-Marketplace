import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton() {
  const { isAuthenticated, logout } = useAuth0();

  if (!isAuthenticated) return null; // Do not render if not logged in

  return (
    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </button>
  );
}