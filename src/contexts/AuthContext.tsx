import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getUserProfile, testSupabaseConnection, createMockUserProfile } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AnonymousUser {
  id: string
  email: string
  user_type: 'admin' | 'owner' | 'user'
  full_name: string
  phone: string | null
  avatar_url: string | null
  status: 'active'
  onboarding_completed: boolean
  email_verified: boolean
  last_active_at: string
  metadata: any
  created_at: string
  updated_at: string
  isAnonymous: true
}

interface AuthContextType {
  user: User | AnonymousUser | null
  userProfile: UserProfile | AnonymousUser | null
  loading: boolean
  isAnonymous: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>
  signInAnonymously: (userType: 'admin' | 'owner' | 'user') => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Anonymous user profiles for different roles
const ANONYMOUS_PROFILES = {
  admin: {
    id: 'anonymous-admin',
    email: 'demo-admin@oifyk.com',
    full_name: 'Demo Administrator',
    phone: null,
    avatar_url: null,
    user_type: 'admin' as const,
    status: 'active' as const,
    onboarding_completed: true,
    email_verified: true,
    last_active_at: new Date().toISOString(),
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isAnonymous: true as const
  },
  owner: {
    id: 'anonymous-owner',
    email: 'demo-owner@oifyk.com',
    full_name: 'Demo Property Owner',
    phone: null,
    avatar_url: null,
    user_type: 'owner' as const,
    status: 'active' as const,
    onboarding_completed: true,
    email_verified: true,
    last_active_at: new Date().toISOString(),
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isAnonymous: true as const
  },
  user: {
    id: 'anonymous-user',
    email: 'demo-user@oifyk.com',
    full_name: 'Demo User',
    phone: null,
    avatar_url: null,
    user_type: 'user' as const,
    status: 'active' as const,
    onboarding_completed: true,
    email_verified: true,
    last_active_at: new Date().toISOString(),
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isAnonymous: true as const
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AnonymousUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | AnonymousUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const refreshProfile = async (currentUser?: User) => {
  const userToUse = currentUser || user;
  
  if (userToUse && !('isAnonymous' in userToUse)) {
    console.log('refreshProfile - Starting for user:', userToUse.id, userToUse.email);
    
    try {
      // Set a timeout for the entire profile refresh operation
      const profilePromise = getUserProfile(userToUse.id);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('refreshProfile timeout after 15 seconds')), 15000);
      });
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      console.log('refreshProfile - getUserProfile returned:', { data, error });
      
      if (!error && data) {
        console.log('refreshProfile - Setting userProfile to:', data);
        setUserProfile(data);
      } else {
        console.log('refreshProfile - Database query failed, creating mock profile...');
        // Create a mock profile if database query fails
        const mockProfile = createMockUserProfile(userToUse);
        console.log('refreshProfile - Using mock profile:', mockProfile);
        setUserProfile(mockProfile);
      }
    } catch (e) {
      console.error('refreshProfile - Exception, falling back to mock profile:', e);
      // Fallback to mock profile on any error
      const mockProfile = createMockUserProfile(userToUse);
      console.log('refreshProfile - Using fallback mock profile:', mockProfile);
      setUserProfile(mockProfile);
    } finally {
      // IMPORTANT: Always set loading to false, regardless of success or failure
      setLoading(false);
    }
  } else {
    console.log('refreshProfile - Skipping: no user or anonymous user');
    setLoading(false);
  }
}
  useEffect(() => {
  let mounted = true;
  
  // Test Supabase connection first
  const initializeAuth = async () => {
    console.log('AuthProvider - Initializing...');
    
    try {
      // Test connection
      const connectionTest = await testSupabaseConnection();
      console.log('AuthProvider - Connection test:', connectionTest);
      
      if (!connectionTest.success) {
        console.error('AuthProvider - Supabase connection failed, proceeding anyway...');
      }
      
      // Get initial session with timeout
      console.log('AuthProvider - Getting initial session...');
      
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getSession timeout')), 5000);
      });
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      console.log('AuthProvider - Initial session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      });
      
      if (mounted) {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider - Calling refreshProfile for initial user');
          await refreshProfile(session.user);
        } else {
          // Important: Set loading to false even when there's no user
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('AuthProvider - Error during initialization:', error);
      // Don't block the app, just set loading to false
      if (mounted) {
        setLoading(false);
      }
    }
  }

  initializeAuth();

  // Set up auth state change listener
  console.log('AuthProvider - Setting up auth state listener...');
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('AuthProvider - Auth state change:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      });
      
      if (!mounted) return;
      
      // Clear anonymous user if real auth event occurs
      if (isAnonymous && event !== 'TOKEN_REFRESHED') {
        console.log('AuthProvider - Clearing anonymous state due to:', event);
        setIsAnonymous(false);
      }
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('AuthProvider - Calling refreshProfile for auth change');
        await refreshProfile(session.user);
      } else {
        console.log('AuthProvider - No user, clearing profile');
        setUserProfile(null);
        setLoading(false); // Important: Set loading to false when signing out
      }
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  const signIn = async (email: string, password: string) => {
    console.log('signIn - Starting with email:', email);
    
    // Clear anonymous user when signing in normally
    // if (isAnonymous) {
    //   console.log('signIn - Clearing anonymous state');
    //   setIsAnonymous(false);
    // }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('signIn - Result:', { error });
      return { error };
    } catch (e) {
      console.error('signIn - Exception:', e);
      return { error: e };
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
  console.log('signUp - Starting with:', { email, userData });
  
  // Clear anonymous user when signing up
  // if (isAnonymous) {
  //   setIsAnonymous(false);
  // }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    console.log('signUp - Auth result:', { 
      user: !!data.user, 
      userId: data.user?.id, 
      error: error?.message 
    });

    if (error) {
      return { error };
    }

    // If user was created successfully, create their profile in the users table
    if (data.user) {
      console.log('signUp - Creating user profile in database...');
      
      try {
        const profileData = {
          id: data.user.id,
          email: email,
          full_name: userData?.full_name || null,
          phone: userData?.phone || null,
          user_type: userData?.user_type || 'user',
          status: 'active' as const,
          onboarding_completed: userData?.metadata?.onboarding_completed || false,
          email_verified: false, // Will be true after email confirmation
          metadata: userData?.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('signUp - Profile data to insert:', profileData);

        const { error: profileError } = await supabase
          .from('users')
          .insert(profileData);

        if (profileError) {
          console.error('signUp - Profile creation error:', profileError);
          // Don't fail the signup if profile creation fails
          // The mock profile will handle this case
        } else {
          console.log('✅ signUp - User profile created successfully');
        }
      } catch (profileCreationError) {
        console.error('signUp - Profile creation exception:', profileCreationError);
        // Continue anyway, mock profile will handle this
      }
    }

    return { error: null };
  } catch (e) {
    console.error('signUp - Exception:', e);
    return { error: e };
  }
};
  const signInAnonymously = async (userType: 'admin' | 'owner' | 'user') => {
    const anonymousProfile = ANONYMOUS_PROFILES[userType];
    
    setUser(anonymousProfile);
    setUserProfile(anonymousProfile);
    setIsAnonymous(true);
    setLoading(false);
  }

  const signOut = async () => {
    if (isAnonymous) {
      // Clear anonymous user
      setIsAnonymous(false);
      setUser(null);
      setUserProfile(null);
    } else {
      // Sign out from Supabase
      await supabase.auth.signOut();
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (isAnonymous) {
      // For anonymous users, just update local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...updates };
        setUserProfile(updatedProfile);
      }
      return { error: null };
    }

    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error };
  }

  const value = {
    user,
    userProfile,
    loading,
    isAnonymous,
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    updateProfile,
    refreshProfile: () => refreshProfile(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}