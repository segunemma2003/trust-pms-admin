import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  user_type: 'admin'
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
}

interface AuthContextType {
  user: User | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.oifyk.com/api'


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token')
      }

      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const profile = await response.json()
      setUserProfile(profile)
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      await signOut()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider - Initializing...')
      
      try {
        const token = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (!token || !refreshToken) {
          setLoading(false)
          return
        }

        // Verify token validity
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const profile = await response.json()
          
          // Only allow admin users
          if (profile.user_type !== 'admin') {
            console.error('Non-admin user attempted to access admin interface')
            await signOut()
            return
          }

          setUser(profile)
          setUserProfile(profile)
        } else if (response.status === 401) {
          // Try to refresh token
          await tryRefreshToken()
        } else {
          throw new Error('Failed to verify token')
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        await signOut()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const tryRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await fetch(`${API_BASE_URL}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh: refreshToken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const { access } = await response.json()
      localStorage.setItem('access_token', access)

      // Get updated profile
      await refreshProfile()
    } catch (error) {
      console.error('Token refresh failed:', error)
      await signOut()
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('signIn - Starting with email:', email)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/jwt/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData }
      }

      const { access, refresh } = await response.json()
      
      // Store tokens
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      // Get user profile
      const profileResponse = await fetch(`${API_BASE_URL}/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${access}`,
          'Content-Type': 'application/json'
        }
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile after login')
      }

      const profile = await profileResponse.json()
      
      // Only allow admin users
      if (profile.user_type !== 'admin') {
        await signOut()
        return { error: { message: 'Access denied. Admin privileges required.' } }
      }

      setUser(profile)
      setUserProfile(profile)
      
      console.log('signIn - Success for admin user:', profile.email)
      return { error: null }
    } catch (error) {
      console.error('signIn - Exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        // Call logout endpoint to invalidate token server-side
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refresh: refreshToken
          })
        }).catch(() => {
          // Ignore errors on logout
        })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Always clear local state
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      setUserProfile(null)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token')
      }

      const response = await fetch(`${API_BASE_URL}/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      await refreshProfile()
      return { error: null }
    } catch (error) {
      console.error('updateProfile - Error:', error)
      return { error }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => refreshProfile(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}