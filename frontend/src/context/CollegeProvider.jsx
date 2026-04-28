import React, { useState, useEffect } from 'react';
import { CollegeContext } from './CollegeContext';
import { useAuth } from './AuthContext';
import { useApiBase } from './ApiContext';

export const CollegeProvider = ({ children }) => {
  const API_BASE = useApiBase();
  const [collegedetails, setCollegedetails] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        // Get the colleges catalog (lightweight list)
        const response = await fetch(`${API_BASE}/colleges/catalog?page=1&pageSize=2000`);
        
        if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
        const json = await response.json();
        
        if (json.success) {
          setCollegedetails(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch colleges into context:', err);
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  return (
    <CollegeContext.Provider value={{ collegedetails, loadingColleges }}>
      {children}
    </CollegeContext.Provider>
  );
};
