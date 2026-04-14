import React, { useState, useEffect } from 'react';
import { CollegeContext } from './CollegeContext';
import { useAuth } from './AuthContext';

export const CollegeProvider = ({ children }) => {
  const [collegedetails, setCollegedetails] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const { user } = useAuth(); // Assume we might need auth to fetch or just to know when to fetch

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // POST request to fetch all colleges
        const response = await fetch(`${API_URL}/colleges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search: '' }) // Empty search to get all initially
        });
        
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
