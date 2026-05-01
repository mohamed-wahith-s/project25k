import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useApiBase } from './ApiContext';
import { supabase } from '../utils/supabase';

export const AuthProvider = ({ children }) => {
  const API_URL = useApiBase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the extended profile from our backend
  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return { ...data, token }; // Include token in the user object
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        const profile = await fetchProfile(session.access_token);
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        // Fallback to local storage if session is null but we had a user 
        // (Supabase session might have expired)
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
             const profile = await fetchProfile(session.access_token);
             if (profile) {
               setUser(profile);
               localStorage.setItem('user', JSON.stringify(profile));
             }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        } else if (event === 'PASSWORD_RECOVERY') {
           // Handled in ResetPassword page
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [API_URL]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // The onAuthStateChange listener will handle fetching the profile
    return data;
  };

  const signup = async (userData) => {
    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    
    // The onAuthStateChange listener will handle the rest, BUT 
    // we might need to wait a tiny bit for the DB trigger to create the profile row
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

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
