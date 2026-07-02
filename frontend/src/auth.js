import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;
const AUTH_STORAGE_KEY = 'kudos-hub:auth';

// The shared account every anonymous action is attributed to (User id 1).
export const GUEST_USER = { id: 1, email: 'guest@kudos.local', username: 'Guest' };

// Read the persisted session (if any) so a refresh keeps the user logged in.
export function getStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save (or clear) the session in localStorage.
function setStoredAuth(next) {
  if (next) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// Fall back to the shared Guest account when nobody is signed in.
export function getCurrentUser() {
  return getStoredAuth()?.user ?? GUEST_USER;
}

export async function login({ email, password }) {
  const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
  setStoredAuth(response.data); // { token, user }
  return response.data;
}

export async function register({ email, username, password }) {
  await axios.post(`${API_BASE_URL}/users`, { email, username, password });
  // Backend registration doesn't return a token, so log in to get one.
  return login({ email, password });
}

export function logout() {
  setStoredAuth(null);
}
