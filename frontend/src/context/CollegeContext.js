import { createContext, useContext } from 'react';

export const CollegeContext = createContext();

export const useColleges = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useColleges must be used within a CollegeProvider');
  }
  return context;
};
