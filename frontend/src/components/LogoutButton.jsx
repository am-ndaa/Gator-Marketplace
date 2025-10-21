import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton() {
  const { isAuthenticated, logout } = useAuth0();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() =>
        logout({
          logoutParams: {
            federated: true,
            returnTo: window.location.origin,
          },
        })
      }
    >
      Log Out
    </button>
  );
}