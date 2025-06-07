import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { 
  mockDashboardMetrics, 
  mockInvitations, 
  mockProperties, 
  mockBookings, 
  mockUsers, 
  mockActivity 
} from './mockData'

type Tables = Database['public']['Tables']
type UserType = Database['public']['Enums']['user_type']

// Helper to check if user is anonymous
const isAnonymousUser = () => {
  return !!localStorage.getItem('anonymous_user')
}

// User Services
export const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    if (isAnonymousUser()) {
      return { data: mockUsers, error: null }
    }
    return await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
  },

  // Update user profile
  updateUser: async (id: string, updates: Partial<Tables['users']['Update']>) => {
    if (isAnonymousUser()) {
      // For demo, just return success
      return { data: { ...mockUsers[0], ...updates }, error: null }
    }
    return await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  // Get users by type
  getUsersByType: async (userType: UserType) => {
    if (isAnonymousUser()) {
      const filteredUsers = mockUsers.filter(user => user.user_type === userType)
      return { data: filteredUsers, error: null }
    }
    return await supabase
      .from('users')
      .select('*')
      .eq('user_type', userType)
      .order('created_at', { ascending: false })
  }
}

// Invitation Services
export const invitationService = {
  // Create invitation (admin only)
  createInvitation: async (invitation: Tables['invitations']['Insert']) => {
    if (isAnonymousUser()) {
      // For demo, simulate creating invitation
      const newInvitation = {
        id: `mock-inv-${Date.now()}`,
        ...invitation,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { data: newInvitation, error: null }
    }
    return await supabase
      .from('invitations')
      .insert(invitation)
      .select()
      .single()
  },

  // Create invitation and send email
  createInvitationWithEmail: async (invitation: Tables['invitations']['Insert'], inviterName: string) => {
    if (isAnonymousUser()) {
      // For demo, simulate creating invitation with email
      const newInvitation = {
        id: `mock-inv-${Date.now()}`,
        ...invitation,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { 
        data: newInvitation, 
        emailSent: true, 
        error: null 
      }
    }
    
    // For real users, this would be implemented in a separate service
    // For now, just create the invitation
    const result = await supabase
      .from('invitations')
      .insert(invitation)
      .select()
      .single()
    
    return {
      data: result.data,
      emailSent: false, // Would be true if email service is implemented
      error: result.error
    }
  },

  // Get all invitations
  getInvitations: async () => {
    if (isAnonymousUser()) {
      return { data: mockInvitations, error: null }
    }
    return await supabase
      .from('invitations')
      .select(`
        *,
        invited_by_user:users!invited_by(full_name, email),
        accepted_by_user:users!accepted_by(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  // Update invitation status
  updateInvitation: async (id: string, updates: Tables['invitations']['Update']) => {
    if (isAnonymousUser()) {
      const invitation = mockInvitations.find(inv => inv.id === id)
      return { data: { ...invitation, ...updates }, error: null }
    }
    return await supabase
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  // Validate onboarding token
 validateToken: async (token: string) => {
  console.log('🔍 validateToken called with:', token);
  
  if (isAnonymousUser()) {
    console.log('✅ Anonymous user - returning mock validation');
    return { 
      data: [{
        is_valid: true,
        email: 'demo@example.com',
        user_type: 'owner' as const,
        invitation_id: 'mock-invitation'
      }], 
      error: null 
    }
  }

  try {
    console.log('🔍 Querying onboarding_tokens table for token:', token.substring(0, 8) + '...');
    
    // UPDATED QUERY - Use .maybeSingle() instead of .single() to handle no results gracefully
    const { data: tokenData, error } = await supabase
      .from('onboarding_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle() // CHANGED: Use maybeSingle() instead of single()

    console.log('📊 Token query result:', { 
      hasData: !!tokenData, 
      error: error?.message,
      errorCode: error?.code,
      tokenDataPreview: tokenData ? {
        email: tokenData.email,
        user_type: tokenData.user_type,
        expires_at: tokenData.expires_at,
        used_at: tokenData.used_at,
        invitation_id: tokenData.invitation_id
      } : null
    });

    if (error) {
      console.log('❌ Token query error:', error);
      return {
        data: [{
          is_valid: false,
          email: '',
          user_type: 'user' as const,
          invitation_id: ''
        }],
        error
      }
    }

    if (!tokenData) {
      console.log('❌ Token not found in database');
      return {
        data: [{
          is_valid: false,
          email: '',
          user_type: 'user' as const,
          invitation_id: ''
        }],
        error: null
      }
    }

    // Check if token is valid (not expired and not used)
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    const isValid = expiresAt > now && !tokenData.used_at

    console.log('⏰ Token validation:', {
      expiresAt: expiresAt.toISOString(),
      now: now.toISOString(),
      isExpired: expiresAt <= now,
      isUsed: !!tokenData.used_at,
      isValid
    });

    return {
      data: [{
        is_valid: isValid,
        email: tokenData.email,
        user_type: tokenData.user_type,
        invitation_id: tokenData.invitation_id || ''
      }],
      error: null
    }
  } catch (error) {
    console.error('❌ Error validating token:', error);
    return {
      data: [{
        is_valid: false,
        email: '',
        user_type: 'user' as const,
        invitation_id: ''
      }],
      error
    }
  }
},

  // Handle invitation response (accept/reject)
  respondToInvitation: async (token: string, action: 'accept' | 'reject') => {
    if (isAnonymousUser()) {
      return {
        success: true,
        action: action === 'accept' ? 'accepted' : 'rejected',
        message: action === 'accept' 
          ? 'Demo invitation accepted!' 
          : 'Demo invitation declined.'
      }
    }
    
    // Real implementation would be here
    return { success: false, error: 'Not implemented for real users yet' }
  },

  // Get invitation by token (for display purposes)
  getInvitationByToken: async (token: string) => {
    if (isAnonymousUser()) {
      return {
        data: {
          id: 'demo-token',
          token: token,
          email: 'demo@example.com',
          user_type: 'owner' as const,
          invitation_id: 'mock-invitation'
        },
        error: null
      }
    }
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('onboarding_tokens')
      .select(`
        *,
        invitation:invitations(
          *,
          inviter:users!invited_by(full_name, email)
        )
      `)
      .eq('token', token)
      .single()

    return { data: tokenData, error: tokenError }
  }
}

// Property Services
export const propertyService = {
  // Get all properties
  getProperties: async () => {
    if (isAnonymousUser()) {
      return { data: mockProperties, error: null }
    }
    return await supabase
      .from('properties')
      .select(`
        *,
        owner:users!owner_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  // Get properties by owner
  getPropertiesByOwner: async (ownerId: string) => {
    if (isAnonymousUser()) {
      const filteredProperties = mockProperties.filter(prop => prop.owner_id === ownerId)
      return { data: filteredProperties, error: null }
    }
    return await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
  },

  // Get active properties (for public viewing)
  getActiveProperties: async () => {
    if (isAnonymousUser()) {
      const activeProperties = mockProperties.filter(prop => prop.status === 'active')
      return { data: activeProperties, error: null }
    }
    return await supabase
      .from('properties')
      .select(`
        *,
        owner:users!owner_id(full_name, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
  },

  // Get properties by status
  getPropertiesByStatus: async (status: Database['public']['Enums']['property_status']) => {
    if (isAnonymousUser()) {
      const filteredProperties = mockProperties.filter(prop => prop.status === status)
      return { data: filteredProperties, error: null }
    }
    return await supabase
      .from('properties')
      .select(`
        *,
        owner:users!owner_id(full_name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
  },

  // Create property
  createProperty: async (property: Tables['properties']['Insert']) => {
    if (isAnonymousUser()) {
      const newProperty = {
        id: `mock-prop-${Date.now()}`,
        ...property,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { data: newProperty, error: null }
    }
    return await supabase
      .from('properties')
      .insert(property)
      .select()
      .single()
  },

  // Update property
  updateProperty: async (id: string, updates: Tables['properties']['Update']) => {
    if (isAnonymousUser()) {
      const property = mockProperties.find(prop => prop.id === id)
      return { data: { ...property, ...updates }, error: null }
    }
    return await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  // Submit property for approval
  submitForApproval: async (propertyId: string, submitterId: string) => {
    if (isAnonymousUser()) {
      return { data: true, error: null }
    }
    return await supabase.rpc('submit_property_for_approval', {
      property_id: propertyId,
      submitter_id: submitterId
    })
  },

  // Approve property (admin only)
  approveProperty: async (propertyId: string, adminId: string, notes?: string) => {
    if (isAnonymousUser()) {
      return { data: true, error: null }
    }
    return await supabase.rpc('approve_property', {
      property_id: propertyId,
      admin_id: adminId,
      approval_notes: notes
    })
  },

  // Reject property (admin only)
  rejectProperty: async (propertyId: string, adminId: string, reason: string) => {
    if (isAnonymousUser()) {
      return { data: true, error: null }
    }
    return await supabase.rpc('reject_property', {
      property_id: propertyId,
      admin_id: adminId,
      rejection_reason: reason
    })
  }
}

// Booking Services
export const bookingService = {
  // Get all bookings
  getBookings: async () => {
    if (isAnonymousUser()) {
      return { data: mockBookings, error: null }
    }
    return await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(title, address, city),
        guest:users!guest_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  // Get bookings by guest
  getBookingsByGuest: async (guestId: string) => {
    if (isAnonymousUser()) {
      const filteredBookings = mockBookings.filter(booking => booking.guest_id === guestId)
      return { data: filteredBookings, error: null }
    }
    return await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(title, address, city, owner_id)
      `)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false })
  },

  // Get bookings by owner
  getBookingsByOwner: async (ownerId: string) => {
    if (isAnonymousUser()) {
      // Filter bookings for properties owned by this owner
      const ownerProperties = mockProperties.filter(prop => prop.owner_id === ownerId)
      const propertyIds = ownerProperties.map(prop => prop.id)
      const filteredBookings = mockBookings.filter(booking => 
        propertyIds.includes(booking.property_id)
      )
      return { data: filteredBookings, error: null }
    }
    return await supabase
      .from('bookings')
      .select(`
        *,
        property:properties!inner(title, address, city),
        guest:users!guest_id(full_name, email)
      `)
      .eq('property.owner_id', ownerId)
      .order('created_at', { ascending: false })
  },

  // Create booking
  createBooking: async (booking: Tables['bookings']['Insert']) => {
    if (isAnonymousUser()) {
      const newBooking = {
        id: `mock-booking-${Date.now()}`,
        ...booking,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { data: newBooking, error: null }
    }
    return await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
  },

  // Update booking
  updateBooking: async (id: string, updates: Tables['bookings']['Update']) => {
    if (isAnonymousUser()) {
      const booking = mockBookings.find(b => b.id === id)
      return { data: { ...booking, ...updates }, error: null }
    }
    return await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  }
}

// Analytics Services (admin only)
export const analyticsService = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    if (isAnonymousUser()) {
      return mockDashboardMetrics
    }

    const [
      { count: totalUsers },
      { count: totalOwners },
      { count: totalProperties },
      { count: activeProperties },
      { count: totalBookings }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'owner'),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
    ])

    return {
      totalUsers: totalUsers || 0,
      totalOwners: totalOwners || 0,
      totalProperties: totalProperties || 0,
      activeProperties: activeProperties || 0,
      totalBookings: totalBookings || 0
    }
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    if (isAnonymousUser()) {
      return { data: mockActivity.slice(0, limit), error: null }
    }
    return await supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
  }
}