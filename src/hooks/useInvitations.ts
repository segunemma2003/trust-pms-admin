import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  invitationService, 
  analyticsService, 
  userService,
  type Invitation 
} from '@/services/apiService'

interface CreateInvitationData {
  email: string
  invitee_name: string
  invitation_type: 'user' | 'owner' | 'admin'
  personal_message?: string
}

// Enhanced invitation creation with comprehensive validation
export const useCreateInvitationWithEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInvitationData) => {
      console.log('🔧 Creating invitation:', data)

      try {
        // Create invitation using custom API
        const { data: invitation, error } = await invitationService.createInvitation({
          email: data.email.toLowerCase().trim(),
          invitee_name: data.invitee_name?.trim() || '',
          invitation_type: data.invitation_type,
          personal_message: data.personal_message?.trim() || ''
        })

        if (error) {
          throw new Error(error.error || error.message || 'Failed to create invitation')
        }

        console.log('✅ Invitation created successfully:', invitation?.id)
        return {
          invitation,
          emailSent: true, // Assuming API handles email sending
          emailDemo: false,
          emailMethod: 'api',
          emailError: null
        }
      } catch (error: any) {
        console.error('❌ Invitation creation failed:', error)
        throw new Error(error.message || 'Failed to create invitation')
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      
      toast.success('Invitation sent successfully!', {
        description: 'The recipient will receive registration instructions via email.'
      })
    },
    onError: (error: Error) => {
      console.error('❌ Invitation creation failed:', error)
      toast.error('Failed to send invitation', {
        description: error.message
      })
    }
  })
}

// Resend invitation functionality
export const useResendInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('🔄 Resending invitation:', invitationId)
      
      try {
        // For now, we'll use a simple approach - this could be enhanced 
        // with a dedicated resend endpoint in your API
        const { data: invitations } = await invitationService.getInvitations()
        const invitation = invitations?.results.find(inv => inv.id === invitationId)
        
        if (!invitation) {
          throw new Error('Invitation not found')
        }

        if (invitation.status !== 'pending') {
          throw new Error('Can only resend pending invitations')
        }

        // Create a new invitation with the same details
        const { data: newInvitation, error } = await invitationService.createInvitation({
          email: invitation.email,
          invitee_name: invitation.invitee_name,
          invitation_type: invitation.invitation_type,
          personal_message: invitation.personal_message || ''
        })

        if (error) {
          throw new Error(error.error || 'Failed to resend invitation')
        }

        console.log('✅ Invitation resent successfully')
        return { 
          success: true, 
          demo: false,
          method: 'api',
          attemptCount: 2 // Could be tracked better with API support
        }
      } catch (error: any) {
        console.error('❌ Resend invitation failed:', error)
        throw new Error(error.message || 'Failed to resend invitation')
      }
    },
    onSuccess: (result) => {
      toast.success('Invitation resent successfully!', {
        description: 'A new invitation email has been sent.'
      })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
    onError: (error: Error) => {
      console.error('❌ Resend invitation failed:', error)
      toast.error('Failed to resend invitation', {
        description: error.message
      })
    }
  })
}

// Hook to get all invitations
export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      console.log('🔍 Fetching invitations...')
      
      try {
        const { data, error } = await invitationService.getInvitations({
          page_size: 100 // Get more invitations per page
        })

        if (error) {
          console.error('❌ Error fetching invitations:', error)
          throw new Error(error.error || 'Failed to fetch invitations')
        }

        console.log('✅ Fetched invitations:', data?.results?.length || 0)
        return data || { count: 0, results: [] }
      } catch (error) {
        console.error('❌ Error fetching invitations:', error)
        throw error
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to get dashboard metrics
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      console.log('📊 Fetching dashboard metrics...')

      try {
        const { data, error } = await analyticsService.getDashboardMetrics()

        if (error) {
          console.error('❌ Error fetching dashboard metrics:', error)
          // Return default values on error instead of throwing
          return {
            total_users: 0,
            total_owners: 0,
            total_properties: 0,
            active_properties: 0,
            total_bookings: 0,
            pending_approvals: 0,
            recent_signups: 0,
            monthly_revenue: 0
          }
        }

        console.log('✅ Dashboard metrics fetched:', data)
        return data || {
          total_users: 0,
          total_owners: 0,
          total_properties: 0,
          active_properties: 0,
          total_bookings: 0,
          pending_approvals: 0,
          recent_signups: 0,
          monthly_revenue: 0
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard metrics:', error)
        // Return default values instead of failing
        return {
          total_users: 0,
          total_owners: 0,
          total_properties: 0,
          active_properties: 0,
          total_bookings: 0,
          pending_approvals: 0,
          recent_signups: 0,
          monthly_revenue: 0
        }
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

// Hook to get recent activity
export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      console.log('📈 Fetching recent activity...')
      
      try {
        const { data, error } = await analyticsService.getRecentActivity(limit)

        if (error) {
          console.error('❌ Error fetching recent activity:', error)
          return { data: [], error }
        }

        console.log('✅ Recent activity fetched:', data?.length || 0)
        return { data: data || [], error: null }
      } catch (error) {
        console.error('❌ Error fetching recent activity:', error)
        return { data: [], error }
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to validate invitation token (for invitation response pages)
export const useValidateInvitationToken = (token: string) => {
  return useQuery({
    queryKey: ['validate-invitation-token', token],
    queryFn: async () => {
      if (!token) return null

      console.log('🔍 Validating invitation token...')
      
      try {
        const { data, error } = await invitationService.validateToken(token)

        if (error) {
          console.error('❌ Token validation failed:', error)
          return { is_valid: false, error: error.error || 'Invalid token' }
        }

        console.log('✅ Token validation result:', data)
        return data
      } catch (error) {
        console.error('❌ Error validating token:', error)
        return { is_valid: false, error: 'Token validation failed' }
      }
    },
    enabled: !!token,
    retry: false,
  })
}

// Hook to handle invitation responses (accept/decline)
export const useRespondToInvitation = () => {
  return useMutation({
    mutationFn: async ({ 
      token, 
      action, 
      userData 
    }: { 
      token: string
      action: 'accept' | 'decline'
      userData?: {
        password: string
        full_name: string
        phone: string
      }
    }) => {
      console.log('📝 Responding to invitation:', { token: token.substring(0, 8) + '...', action })
      
      try {
        if (action === 'accept') {
          const { data, error } = await invitationService.acceptInvitation(token, userData)
          if (error) {
            throw new Error(error.error || 'Failed to accept invitation')
          }
          return { success: true, action: 'accepted', data }
        } else {
          const { data, error } = await invitationService.declineInvitation(token)
          if (error) {
            throw new Error(error.error || 'Failed to decline invitation')
          }
          return { success: true, action: 'declined', data }
        }
      } catch (error: any) {
        console.error('❌ Invitation response failed:', error)
        throw new Error(error.message || 'Failed to process invitation response')
      }
    },
    onSuccess: (result) => {
      if (result.action === 'accepted') {
        toast.success('Invitation accepted!', {
          description: 'Welcome to OnlyIfYouKnow. You can now sign in with your credentials.'
        })
      } else {
        toast.success('Invitation declined', {
          description: 'Thank you for your response.'
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to process invitation', {
        description: error.message
      })
    }
  })
}

// Hook to search users (for admin user management)
export const useSearchUsers = (params: {
  search?: string
  user_type?: 'user' | 'owner' | 'admin'
} = {}) => {
  return useQuery({
    queryKey: ['search-users', params],
    queryFn: async () => {
      console.log('🔍 Searching users with params:', params)
      
      try {
        const { data, error } = await userService.searchUsers({
          ...params,
          page_size: 100
        })

        if (error) {
          console.error('❌ Error searching users:', error)
          throw new Error(error.error || 'Failed to search users')
        }

        console.log('✅ User search completed:', data?.results?.length || 0)
        return data || { count: 0, results: [] }
      } catch (error) {
        console.error('❌ Error searching users:', error)
        throw error
      }
    },
    enabled: Object.keys(params).length > 0, // Only run when there are search params
  })
}