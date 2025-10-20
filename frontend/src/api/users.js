// Helper functions for calling the backend Users API.
// Usage examples are similar to your Listings API.

// Vite env variable setup
const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin.replace(/:\d+$/, '') || '';

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

// Get the user's profile (by Auth0 ID)
export async function getUserProfile(auth0Id, token) {
  const url = `${API_BASE}/api/users/${auth0Id}/`;
  const resp = await fetch(url, { headers: makeHeaders(token) });
  return handleResp(resp);
}

// Get user by MongoDB ObjectId
export async function getUserById(userId, token) {
  const url = `${API_BASE}/api/users/by-id/${userId}/`;
  const resp = await fetch(url, { headers: makeHeaders(token) });
  return handleResp(resp);
}

// Create a new user profile
export async function createUserProfile(profileData, token) {
  const url = `${API_BASE}/api/users/`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify(profileData),
  });
  return handleResp(resp);
}

// Update an existing user's profile (profile picture, description, etc)
export async function updateUserProfile(auth0Id, updateData, token) {
  const url = `${API_BASE}/api/users/${auth0Id}/`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: makeHeaders(token),
    body: JSON.stringify(updateData),
  });
  return handleResp(resp);
}

// Optionally, delete the user (rarely needed, but included for parity)
export async function deleteUserProfile(auth0Id, token) {
  const url = `${API_BASE}/api/users/${auth0Id}/`;
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: makeHeaders(token),
  });
  return handleResp(resp);
}

export default {
  getUserProfile,
  getUserById,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
