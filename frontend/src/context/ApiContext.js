import { createContext, useContext } from 'react';

// ── Single source of truth for the backend base URL ──────────────────────────
// Change this ONE constant to point to any environment; no .env file needed.
// export const API_BASE_URL = 'https://collegediaries.in/api'; // Production
export const API_BASE_URL = 'http://localhost:5000/api'; // Local Development

export const ApiContext = createContext(API_BASE_URL);

/** Returns the backend base URL string. */
export const useApiBase = () => useContext(ApiContext);
