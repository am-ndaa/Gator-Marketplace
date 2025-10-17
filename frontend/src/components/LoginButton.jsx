import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import './LoginButton.css'

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() =>
        loginWithRedirect({
          authorizationParams: {
            prompt: "select_account",
            connection: 'google-oauth2',
          }
        })
      }
    >
      UFL Login
    </button>
  );
};

export default LoginButton;