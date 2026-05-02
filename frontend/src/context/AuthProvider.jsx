import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { useApiBase } from './ApiContext';
import { supabase } from '../utils/supabase';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Read the last-known user from localStorage. Used for instant UI hydration
 * on page load so users never see a logged-out flash while auth resolves.
 */
function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(u) {
  try {
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  } catch {}
}

function buildFallbackUser(session) {
  const meta = session.user?.user_metadata || {};
  return {
    token: session.access_token,
    email: session.user.email,
    studentName: meta.full_name || meta.name || '',
    phone: meta.phone || '',
    date_of_birth: meta.date_of_birth || '',
    isSubscribed: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const API_URL = useApiBase();

  // Seed from localStorage immediately so the UI never flashes "logged out"
  // while Supabase resolves the real session. We'll overwrite this with the
  // fresh backend profile once it arrives.
  const [user, setUserState] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  // Keeps the latest API_URL accessible inside async callbacks without
  // recreating them on every render.
  const apiUrlRef = useRef(API_URL);
  useEffect(() => { apiUrlRef.current = API_URL; }, [API_URL]);

  // Prevent the onAuthStateChange listener and initializeAuth from racing.
  const resolving = useRef(false);

  // ── Setters that keep localStorage in sync ──────────────────────────────
  const setUser = useCallback((u) => {
    writeStoredUser(u);
    setUserState(u);
  }, []);

  const clearUser = useCallback(() => {
    // Clear storage FIRST so any re-render triggered by setUserState(null)
    // immediately sees no stored user (prevents the "still logged in" flash).
    localStorage.removeItem('user');
    setUserState(null);
  }, []);

  // ── Backend profile fetch ────────────────────────────────────────────────
  const fetchProfile = useCallback(async (token) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${apiUrlRef.current}/auth/profile`, {
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
  }, []);

  // ── Resolve user from a live Supabase session ────────────────────────────
  const resolveUserFromSession = useCallback(async (session, isSignIn = false) => {
    let profile = await fetchProfile(session.access_token);

    // After a fresh SIGNED_IN the DB row may not exist yet — retry once.
    if (!profile && isSignIn) {
      await new Promise((r) => setTimeout(r, 1500));
      profile = await fetchProfile(session.access_token);
    }

    if (profile) {
      setUser(profile);
      return;
    }

    // Backend unreachable — reuse stored user if email matches, else fallback.
    const stored = readStoredUser();
    if (stored && stored.email === session.user.email) {
      // Refresh the token in case it changed.
      setUser({ ...stored, token: session.access_token });
      return;
    }

    setUser(buildFallbackUser(session));
  }, [fetchProfile, setUser]);

  // ── Auth lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    // ── 1. Subscribe to auth events ─────────────────────────────────────────
    // Supabase v2 fires INITIAL_SESSION on every page load for existing
    // sessions (including hard refreshes), so we handle it here instead of
    // relying on a separate getSession() call that can race.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'INITIAL_SESSION') {
          // This fires on page load. It tells us about the existing session.
          if (session) {
            // Don't wait for the backend if we already have a matching stored
            // user — show it instantly and refresh in the background.
            const stored = readStoredUser();
            if (stored && stored.email === session.user.email) {
              setUserState(stored); // already in localStorage, skip setUser to avoid double write
              setLoading(false);
              // Refresh profile from backend silently
              if (!resolving.current) {
                resolving.current = true;
                fetchProfile(session.access_token).then(fresh => {
                  if (fresh && mounted) setUser(fresh);
                  resolving.current = false;
                });
              }
            } else {
              // No stored user or different account — must wait for backend.
              if (!resolving.current) {
                resolving.current = true;
                await resolveUserFromSession(session);
                resolving.current = false;
              }
              if (mounted) setLoading(false);
            }
          } else {
            // No session at all (logged out).
            clearUser();
            if (mounted) setLoading(false);
          }
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session && !resolving.current) {
            resolving.current = true;
            await resolveUserFromSession(session, event === 'SIGNED_IN');
            resolving.current = false;
          }
          if (mounted) setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          // Clear storage before updating state so there's zero window
          // where the UI can read stale data from localStorage.
          clearUser();
          if (mounted) setLoading(false);
          return;
        }
      }
    );

    // ── 2. If Supabase doesn't fire INITIAL_SESSION within 10 s, give up ──
    // (safety net — should never trigger in practice)
    const giveUp = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 10000);

    return () => {
      mounted = false;
      clearTimeout(giveUp);
      authListener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
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
    return data;
  };

  const logout = async () => {
    // Optimistically clear local state first so the UI snaps immediately.
    clearUser();
    await supabase.auth.signOut();
    // SIGNED_OUT event from onAuthStateChange will call clearUser() again — that's fine.
  };

  const updateUser = (data) => {
    setUserState((prev) => {
      const updated = { ...prev, ...data };
      writeStoredUser(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
