import React, { createContext, useState, useCallback, useContext } from 'react';
import { useApi } from './ApiContext';
import { AdminAuthContext } from './AdminAuthContext';

export const CollegeContext = createContext();

export const CollegeProvider = ({ children }) => {
  const { api } = useApi();
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useContext(AdminAuthContext);

  const fetchColleges = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/colleges');
      if (data.success) {
        setColleges(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch colleges", err);
      setError("Failed to fetch college list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <CollegeContext.Provider value={{ colleges, isLoading, error, fetchColleges }}>
      {children}
    </CollegeContext.Provider>
  );
};
