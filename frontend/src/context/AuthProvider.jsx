import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useApiBase } from './ApiContext';

/**
 * Decode a JWT payload without verifying the signature.
 * Returns null if the token is malformed or expired.
 */
const decodeJWT = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const API_URL = useApiBase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('user');

    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);

        // If there's a JWT token, validate it hasn't expired
        if (savedUser.token) {
          const payload = decodeJWT(savedUser.token);
          if (payload) {
            // Token is valid — restore session
            setUser(savedUser);
          } else {
            // Token expired — clear storage and stay as guest
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // No token field — treat as guest (legacy / broken session)
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      // Nothing in storage → guest mode
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
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
