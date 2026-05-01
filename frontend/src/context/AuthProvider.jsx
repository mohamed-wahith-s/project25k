import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useApiBase } from './ApiContext';
import { supabase } from '../utils/supabase';

export const AuthProvider = ({ children }) => {
  const API_URL = useApiBase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the extended profile from our Express backend.
   * Returns null if the backend is unreachable or the profile row doesn't exist yet.
   * Uses a 5-second timeout so a slow backend doesn't block the UI forever.
   */
  const fetchProfile = async (token) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      return { ...data, token };
    } catch (err) {
      console.warn('fetchProfile failed (backend may be unreachable):', err.message);
      return null;
    }
  };

  /**
   * Build a minimal user object from the Supabase session when the
   * backend profile is unavailable (e.g. first signup, backend down).
   */
  const buildFallbackUser = (session) => {
    const meta = session.user?.user_metadata || {};
    return {
      token: session.access_token,
      email: session.user.email,
      studentName: meta.full_name || meta.name || '',
      phone: meta.phone || '',
      date_of_birth: meta.date_of_birth || '',
      isSubscribed: false,
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const profile = await fetchProfile(session.access_token);
          if (profile) {
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } else {
            // Backend unreachable or profile row not created yet — use Supabase metadata
            const fallback = buildFallbackUser(session);
            setUser(fallback);
            localStorage.setItem('user', JSON.stringify(fallback));
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            // After signup the DB trigger needs a moment to create the profile row.
            // Try immediately, then retry once after 1.5 s if still null.
            let profile = await fetchProfile(session.access_token);
            if (!profile && event === 'SIGNED_IN') {
              await new Promise((r) => setTimeout(r, 1500));
              profile = await fetchProfile(session.access_token);
            }

            if (profile) {
              setUser(profile);
              localStorage.setItem('user', JSON.stringify(profile));
            } else {
              // Still unavailable — fall back to Supabase metadata so the
              // user is logged in and can use the app
              const fallback = buildFallbackUser(session);
              setUser(fallback);
              localStorage.setItem('user', JSON.stringify(fallback));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
        // PASSWORD_RECOVERY is handled in the ResetPassword page
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [API_URL]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // onAuthStateChange fires SIGNED_IN → sets user
    return data;
  };

  const signup = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
        },
      },
    });
    if (error) throw new Error(error.message);
    // onAuthStateChange fires SIGNED_IN → sets user
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (data) => setUser((prev) => {
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
