import { createContext, useContext } from 'react';

// ── Single source of truth for the backend base URL ──────────────────────────
// Change this ONE constant to point to any environment; no .env file needed.
// export const API_BASE_URL = 'https://api.collegediaries.in/api';
export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://api.collegediaries.in/api';

export const ApiContext = createContext(API_BASE_URL);

/** Returns the backend base URL string. */
export const useApiBase = () => useContext(ApiContext);
