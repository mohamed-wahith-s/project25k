import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';

// ─── Change only this line to point to a different backend ───────────────────
const BACKEND_URL = 'http://3.107.10.1:5000/api';
// ─────────────────────────────────────────────────────────────────────────────

export const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  /**
   * Create the axios instance once (useMemo prevents re-creation on re-renders).
   * All interceptors are attached here so every context/page that calls
   * useApi() gets the same pre-configured instance automatically.
   */
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BACKEND_URL });

    // Attach JWT token to every outgoing request
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 globally — clear token and redirect to login
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []); // empty deps → created once for the lifetime of the app

  return (
    <ApiContext.Provider value={{ api, baseURL: BACKEND_URL }}>
      {children}
    </ApiContext.Provider>
  );
};

/**
 * useApi — consume anywhere in the component tree.
 * 
 * Usage:
 *   const { api } = useApi();
 *   const { data } = await api.get('/admin/users');
 */
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used inside <ApiProvider>');
  }
  return context;
};
