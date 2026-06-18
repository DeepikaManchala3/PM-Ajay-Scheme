import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// User roles
export const ROLES = {
  MINISTRY: 'centre_admin',  // Changed to match database constraint
  STATE: 'state_admin',
  DISTRICT: 'district_admin',
  GP: 'gp_admin',
  DEPARTMENT: 'department_admin',
  CONTRACTOR: 'contractor',
  IMPLEMENTING_AGENCY: 'implementing_agency',
  EXECUTING_AGENCY: 'executing_agency',
  PUBLIC: 'public'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force loading to false after 3 seconds to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth check timed out, setting loading to false');
      setLoading(false);
    }, 3000);

    // Check active session
    const checkSession = async () => {
      try {
        // FIRST: Check localStorage for manually stored session (faster, no network)
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user) {
            console.log('✅ Loading user from localStorage:', sessionData.user.email);
            console.log('✅ User role from localStorage:', sessionData.user.role);

            // CRITICAL FIX: Restore session to Supabase client
            if (sessionData.access_token && sessionData.refresh_token) {
              await supabase.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token
              });
            }

            let role = sessionData.user.role || 'centre_admin';
            if (sessionData.user.email === 'centre@pmajay.gov') {
              role = 'centre_admin';
            }

            setUser({
              id: sessionData.user.id,
              email: sessionData.user.email,
              role: role,
              ...sessionData.user
            });
            clearTimeout(loadingTimeout);
            setLoading(false);
            return;
          }
        }

        // FALLBACK: Try Supabase session (might hang on some systems)
        console.log('No localStorage session, trying Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user);
        } else {
          setLoading(false);
        }
        clearTimeout(loadingTimeout);
      } catch (error) {
        console.error('Error checking session:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    checkSession();

    return () => clearTimeout(loadingTimeout);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId, sessionUser = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to session user if profile fetch fails (e.g. RLS issue)
        if (sessionUser) {
          console.warn('Falling back to session user data');
          const role = sessionUser.email === 'centre@pmajay.gov' ? 'centre_admin' : 'authenticated';
          setUser({ ...sessionUser, role });
        }
      } else if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      if (sessionUser) {
        const role = sessionUser.email === 'centre@pmajay.gov' ? 'centre_admin' : 'authenticated';
        setUser({ ...sessionUser, role });
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
