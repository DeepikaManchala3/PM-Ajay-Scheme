import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Alert } from 'react-native';

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
  MINISTRY: 'centre_admin',
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

  // Fetch State Name if State Admin
  const fetchStateName = async (userId) => {
    try {
      // Check state_assignment for state name
      const { data, error } = await supabase
        .from('state_assignment')
        .select('state_name')
        .eq('email', user?.email) // We might not have email here if called with just ID... 
      // Better: use profiles join or separate query.
      // Actually, let's just make a best effort query using the email if available in profile

    } catch (e) { console.log(e) }
  };

  // Effect to manage Realtime Notification Listener
  useEffect(() => {
    let cleanupListener = () => { };

    if (user?.id) {
      const { setupRealtimeNotificationListener } = require('../services/notificationService');
      cleanupListener = setupRealtimeNotificationListener(user);
    }

    return () => {
      if (cleanupListener) cleanupListener();
    };
  }, [user?.id]);

  // Modified getUserProfile logic to include state name
  const getUserProfile = async (sessionUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    let enhancedUser = profile ? { ...sessionUser, ...profile } : sessionUser;

    // If state admin, try to get state name
    if (enhancedUser.role === 'state_admin' && enhancedUser.email) {
      const { data: assignment } = await supabase
        .from('state_assignment')
        .select('state_name')
        .eq('email', enhancedUser.email)
        .single();
      if (assignment) {
        enhancedUser.state_name = assignment.state_name;
      }
    }

    return enhancedUser;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userWithProfile = await getUserProfile(session.user);
          setUser(userWithProfile);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userWithProfile = await getUserProfile(session.user);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      console.log('✅ Login successful:', data?.user?.email);

      // Register Push Token on Login
      try {
        const { registerForPushNotificationsAsync } = require('../services/notificationService');
        const token = await registerForPushNotificationsAsync();

        if (token) {
          console.log('📲 Generated new push token:', token);

          if (data?.user?.id) {
            const userId = data.user.id;
            console.log('📲 Updating push token for user:', userId);

            // Helper function to update token
            const updateToken = async () => {
              const { data, error } = await supabase
                .from('profiles')
                .update({ push_token: token })
                .eq('id', userId)
                .select();
              return { data, error };
            };

            // Attempt 1
            let { data: updateResult, error: tokenError } = await updateToken();

            // If no rows updated (profile missing?), wait and retry
            if (!tokenError && (!updateResult || updateResult.length === 0)) {
              console.log('⚠️ Profile not found immediately. Waiting 2s for trigger...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              const retryResult = await updateToken();
              tokenError = retryResult.error;
              updateResult = retryResult.data;
            }

            // If still no profile, we might need to create it manually (fallback)
            if (!tokenError && (!updateResult || updateResult.length === 0)) {
              console.log('⚠️ Profile still missing. Creating profile with push token...');
              
              // First check if profile exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, email, role')
                .eq('id', userId)
                .single();
              
              if (existingProfile) {
                console.log('⚠️ Profile exists but update failed. Possible RLS policy issue.');
                console.log('📊 Existing profile:', existingProfile);
                // Try direct RPC call as fallback
                const { error: rpcError } = await supabase.rpc('update_push_token', {
                  user_id: userId,
                  new_token: token
                }).catch(() => ({ error: { message: 'RPC function not available' } }));
                
                if (!rpcError) {
                  console.log('✅ Push token saved via RPC');
                } else {
                  console.error('❌ RPC also failed:', rpcError.message);
                }
              } else {
                // Profile doesn't exist, create it
                const { error: insertError, data: insertData } = await supabase
                  .from('profiles')
                  .insert({
                    id: userId,
                    email: email,
                    role: 'state_admin',
                    push_token: token
                  })
                  .select();

                if (insertError) {
                  console.error('❌ Error creating profile:', insertError);
                } else {
                  console.log('✅ Profile created with push token');
                  console.log('✅ Created profile:', insertData?.[0]);
                }
              }

            } else if (tokenError) {
              console.error('❌ Error saving token to DB:', tokenError);
              console.error('❌ Error code:', tokenError.code);
              console.error('❌ Error message:', tokenError.message);
              console.error('❌ Error details:', tokenError.details);
            } else {
              console.log('✅ Push token saved to profile');
              console.log('✅ Token saved for user ID:', userId);
              console.log('✅ Token value:', token.substring(0, 30) + '...');
              console.log('✅ Rows updated:', updateResult?.length || 0);
              if (updateResult && updateResult.length > 0) {
                console.log('✅ Updated profile data:', {
                  id: updateResult[0].id,
                  email: updateResult[0].email,
                  has_token: !!updateResult[0].push_token
                });
              }
            }
          } else {
            console.warn('⚠️ No User ID found in session data, cannot save token.');
          }
        } else {
          console.log('⚠️ Failed to generate push token (likely permission denied or simulator).');
        }
      } catch (tokenErr) {
        console.error('❌ Error in token registration process:', tokenErr);
      }

      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      Alert.alert('Login Failed', error.message || 'Network request failed. Please check your internet connection.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
