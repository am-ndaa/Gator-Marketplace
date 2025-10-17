// Helper functions for calling the backend Listings API.
// Usage examples in comments show how to integrate with Auth0 from React.

// Prefer Vite environment variable VITE_API_BASE (set in frontend/.env.local).
// Vite exposes env vars via import.meta.env.VITE_*
const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin.replace(/:\d+$/, '') || '';
// If frontend runs on a different host/port than backend, set VITE_API_BASE in `frontend/.env.local`.

async function handleResp(resp) {
  const ct = resp.headers.get('content-type') || '';
  if (resp.status === 204) return null;
  if (ct.includes('application/json')) {
    const body = await resp.json();
    if (!resp.ok) throw { status: resp.status, body };
    return body;
  }
  const text = await resp.text();
  if (!resp.ok) throw { status: resp.status, body: text };
  return text;
}

function makeHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function listListings({ q, filter } = {}, token) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (filter) params.set('filter', filter);
  const url = `${API_BASE}/api/listings/` + (params.toString() ? `?${params.toString()}` : '');
  const resp = await fetch(url, { headers: makeHeaders(token) });
  return handleResp(resp);
}

export async function createListing(listingData, token) {
  const url = `${API_BASE}/api/listings/`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify(listingData),
  });
  return handleResp(resp);
}

export async function getListing(listingId, token) {
  const url = `${API_BASE}/api/listings/${listingId}/`;
  const resp = await fetch(url, { headers: makeHeaders(token) });
  return handleResp(resp);
}

export async function updateListing(listingId, updateData, token, { partial = true } = {}) {
  const url = `${API_BASE}/api/listings/${listingId}/`;
  const resp = await fetch(url, {
    method: partial ? 'PATCH' : 'PUT',
    headers: makeHeaders(token),
    body: JSON.stringify(updateData),
  });
  return handleResp(resp);
}

export async function deleteListing(listingId, token) {
  const url = `${API_BASE}/api/listings/${listingId}/`;
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: makeHeaders(token),
  });
  return handleResp(resp);
}

// Example usage with Auth0 in a React component:
// import { useAuth0 } from '@auth0/auth0-react';
// import * as api from '../api/listings';
// const { getAccessTokenSilently } = useAuth0();
// const token = await getAccessTokenSilently();
// const listings = await api.listListings({}, token);

export default {
  listListings,
  createListing,
  getListing,
  updateListing,
  deleteListing,
};
