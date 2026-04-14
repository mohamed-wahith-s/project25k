import React, { useState, useEffect } from 'react';
import { CollegeContext } from './CollegeContext';
import { useAuth } from './AuthContext';
import { getApiBase, joinApi } from '../utils/apiBase';

export const CollegeProvider = ({ children }) => {
  const [collegedetails, setCollegedetails] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const { user } = useAuth(); // Assume we might need auth to fetch or just to know when to fetch

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const API_BASE = getApiBase();
        
        // Get the colleges catalog (lightweight list)
        const response = await fetch(joinApi(API_BASE, '/colleges/catalog?page=1&pageSize=2000'));
        
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
