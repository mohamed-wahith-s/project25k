import React, { createContext, useState, useEffect, useContext } from 'react';
import { useApi } from './ApiContext';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const { api } = useApi();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/admin/profile');
        if (data.success) {
          setAdmin(data.data);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Failed to fetch admin profile", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, [token]);

  const login = (newToken, adminData) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
