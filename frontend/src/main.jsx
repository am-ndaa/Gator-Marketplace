import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain="dev-vzjmeo4vnrvys66u.us.auth0.com"
    clientId="L7pHCpj1oA71vNsPhA6KTWhYWpyu3uNM"
    authorizationParams={{
      redirect_uri: window.location.origin + '/homepage'
    }}
    cacheLocation="localstorage" 
  >
    <App />
  </Auth0Provider>,
);