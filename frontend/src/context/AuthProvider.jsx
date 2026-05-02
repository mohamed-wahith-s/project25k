import React, { useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { useApiBase } from './ApiContext';
import { supabase } from '../utils/supabase';

export const AuthProvider = ({ children }) => {
  const API_URL = useApiBase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Tracks whether onAuthStateChange has already handled the current session,
  // so initializeAuth doesn't race with it and double-set loading.
  const authHandledRef = useRef(false);

  /**
   * Fetch the extended profile from our Express backend.
   * Returns null if the backend is unreachable or the profile row doesn't exist yet.
   * Uses an 8-second timeout so a slow cold-start backend doesn't block the UI.
   */
  const fetchProfile = async (token) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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

  /**
   * Resolves user state from a live Supabase session.
   * Tries backend profile first, falls back to localStorage, then Supabase metadata.
   */
  const resolveUserFromSession = async (session, isSignIn = false) => {
    let profile = await fetchProfile(session.access_token);

    // After a fresh SIGNED_IN the DB row may not exist yet — retry once.
    if (!profile && isSignIn) {
      await new Promise((r) => setTimeout(r, 1500));
      profile = await fetchProfile(session.access_token);
    }

    if (profile) {
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      return;
    }

    // Backend unreachable — use last known localStorage state if email matches
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email === session.user.email) {
          setUser(parsed);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse stored user:', e);
      }
    }

    // Last resort: build from Supabase metadata
    const fallback = buildFallbackUser(session);
    setUser(fallback);
  };

  useEffect(() => {
    authHandledRef.current = false;

    // ── Step 1: Subscribe FIRST so we don't miss any event that fires
    //    before getSession() resolves.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          authHandledRef.current = true; // signal initializeAuth to skip
          if (session) {
            await resolveUserFromSession(session, event === 'SIGNED_IN');
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          authHandledRef.current = true;
          setUser(null);
          localStorage.removeItem('user');
          setLoading(false);
        }
        // PASSWORD_RECOVERY is handled in the ResetPassword page
      }
    );

    // ── Step 2: Initialise from existing session (for hard refreshes).
    //    If onAuthStateChange already handled it, just clear the spinner.
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Give the listener a chance to fire first (it fires synchronously
        // before getSession resolves when the session is from localStorage).
        if (authHandledRef.current) return;

        if (session) {
          await resolveUserFromSession(session);
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

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [API_URL]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // onAuthStateChange fires SIGNED_IN → sets user and loading=false
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
    // onAuthStateChange fires SIGNED_OUT and clears state
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
