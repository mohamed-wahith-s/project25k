import React, { createContext, useState, useCallback, useContext } from 'react';
import { useApi } from './ApiContext';
import { AdminAuthContext } from './AdminAuthContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { api } = useApi();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useContext(AdminAuthContext);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to fetch user applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ users, isLoading, error, fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};
