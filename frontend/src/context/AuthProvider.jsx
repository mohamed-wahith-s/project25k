import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('user');
    const demoDefaults = {
      studentName: "RAJA GURU",
      email: "demo@tneahub.com",
      phone: "9876543210",
      isSubscribed: true, 
      caste: "BC",
      physics: 98,
      chemistry: 95,
      maths: 99,
      cutoff: 195.5
    };

    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      // Force refresh demo user to latest code defaults
      if (savedUser.email === demoDefaults.email) {
        setUser(demoDefaults);
      } else {
        setUser(savedUser);
      }
    } else {
      setUser(demoDefaults);
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    // Mock Login for Demo (Bypasses Backend for the provided demo credentials)
    if (identifier === "demo@tneahub.com") {
      const demoUser = {
        studentName: "RAJA GURU", email: "demo@tneahub.com", phone: "9876543210",
        isSubscribed: true, // Pro User demo
        caste: "BC", physics: 98, chemistry: 95, maths: 99, cutoff: 195.5
      };
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      return demoUser;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  };
  const logout = () => { setUser(null); localStorage.removeItem('user'); };
  const updateUser = (data) => setUser(prev => {
    const updated = { ...prev, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  });

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
