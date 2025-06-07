import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config Check:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseKey ? 'Present' : 'Missing',
  urlLength: supabaseUrl?.length,
  keyLength: supabaseKey?.length
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Helper function to get current user with timeout
export const getCurrentUser = async () => {
  console.log('getCurrentUser - Starting...');
  
  try {
    // Add a timeout to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('getUser timeout after 10 seconds')), 10000);
    });
    
    const getUserPromise = supabase.auth.getUser();
    
    const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise]) as any;
    
    console.log('getCurrentUser - Result:', { user: !!user, userId: user?.id, email: user?.email, error });
    return { user, error };
  } catch (e) {
    console.error('getCurrentUser - Exception:', e);
    return { user: null, error: e };
  }
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { user } = await getCurrentUser()
  return !!user
}

// Enhanced getUserProfile with timeout and better debugging
export const getUserProfile = async (userId: string) => {
  console.log('getUserProfile - Starting with userId:', userId);
  
  try {
    // Skip the getUser call that's causing issues and go straight to profile query
    console.log('getUserProfile - Querying user profile directly...');
    
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('getUserProfile query timeout after 10 seconds')), 10000);
    });
    
    console.log('getUserProfile - About to execute query with timeout...');
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    console.log('getUserProfile - Direct query completed:', { 
      hasData: !!data, 
      error: error?.message || error?.code,
      userId: data?.id,
      email: data?.email 
    });
    
    // If direct query fails, try by email for admin users
    if (error && error.code === 'PGRST116') {
      console.log('getUserProfile - No rows found, trying email fallback...');
      
      // Try to get session to check if this is an admin
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email === 'admin@admin.com') {
        console.log('getUserProfile - Admin detected, querying by email...');
        
        const emailQueryPromise = supabase
          .from('users')
          .select('*')
          .eq('email', 'admin@admin.com')
          .single();
        
        const emailTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Email query timeout after 10 seconds')), 10000);
        });
        
        const { data: emailData, error: emailError } = await Promise.race([emailQueryPromise, emailTimeoutPromise]) as any;
        
        console.log('getUserProfile - Email query result:', { data: emailData, error: emailError });
        
        if (emailData && !emailError) {
          if (emailData.id !== userId) {
            console.error('getUserProfile - ID MISMATCH DETECTED!', {
              authUserId: userId,
              profileUserId: emailData.id,
              email: emailData.email
            });
          }
          return { data: emailData, error: null };
        }
      }
    }
    
    return { data, error };
    
  } catch (e) {
    console.error('getUserProfile - Exception caught:', e);
    return { data: null, error: e };
  }
}

// Add a function to test Supabase connectivity
export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection with timeout
    console.log('testSupabaseConnection - Testing basic query...');
    const basicQueryPromise = supabase.from('users').select('count').limit(1);
    const basicTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Basic query timeout after 10 seconds')), 10000);
    });
    
    const { data, error } = await Promise.race([basicQueryPromise, basicTimeoutPromise]) as any;
    console.log('Connection test result:', { data, error });
    
    // Test 2: Auth service with timeout
    console.log('testSupabaseConnection - Testing session...');
    const sessionPromise = supabase.auth.getSession();
    const sessionTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session query timeout after 10 seconds')), 10000);
    });
    
    const { data: sessionData } = await Promise.race([sessionPromise, sessionTimeoutPromise]) as any;
    console.log('Session test result:', { session: !!sessionData.session });
    
    return { success: true, error: null };
  } catch (e) {
    console.error('Supabase connection test failed:', e);
    return { success: false, error: e };
  }
}

// Temporary bypass function for testing
export const createMockUserProfile = (user: any) => {
  console.log('createMockUserProfile - Creating mock profile for:', user?.email);
  
  // Create a mock profile based on email
  if (user?.email === 'admin@admin.com') {
    return {
      id: user.id,
      email: user.email,
      full_name: 'Admin User',
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
    };
  }
  
  // Default user profile
  return {
    id: user.id,
    email: user.email,
    full_name: user.email?.split('@')[0] || 'User',
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
  };
}