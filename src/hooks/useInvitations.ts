import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/emailService'
import { toast } from 'sonner'
import type { Database } from '@/lib/database.types'

type InvitationType = Database['public']['Enums']['user_type']

interface CreateInvitationData {
  email: string
  invitee_name: string | null
  invitation_type: InvitationType
  personal_message?: string | null
}

// Define the expected metadata structure
interface InvitationMetadata {
  invited_by?: string
  invitee_name?: string | null
  created_at?: string
  resent_by?: string
  resent_at?: string
  invitation_attempt?: number
  [key: string]: any // Allow for additional properties
}

// Type guard to check if metadata is an object
const isMetadataObject = (metadata: any): metadata is InvitationMetadata => {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
}

// Helper to safely get metadata with defaults
const getMetadata = (metadata: any): InvitationMetadata => {
  if (isMetadataObject(metadata)) {
    return metadata
  }
  return {}
}


const generateUUID = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return generateUUID()
          }
          // Fallback UUID generator
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0
            const v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
          })
        }

// Enhanced invitation creation with comprehensive validation
export const useCreateInvitationWithEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInvitationData) => {
      console.log('🔧 Creating invitation with enhanced validation:', data)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('You must be logged in to send invitations.')
      }

      // Get user profile for inviter name
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const inviterName = userProfile?.full_name || user.email?.split('@')[0] || 'OIFYK Team'

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address.')
      }

      const cleanEmail = data.email.toLowerCase().trim()

      // 🔍 ENHANCED VALIDATION 1: Check if user already exists in the system
      console.log('🔍 Checking if user already exists...')
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, user_type, status')
        .eq('email', cleanEmail)
        .single()

      if (existingUser) {
        if (existingUser.user_type === data.invitation_type) {
          throw new Error(`A ${data.invitation_type} with this email address already exists in the system.`)
        } else {
          throw new Error(`This email is already registered as a ${existingUser.user_type}. Users cannot have multiple account types.`)
        }
      }

      // 🔍 ENHANCED VALIDATION 2: Check for ANY existing invitations (not just pending)
      console.log('🔍 Checking for existing invitations...')
      const { data: existingInvitations } = await supabase
        .from('invitations')
        .select('id, status, invitation_type, created_at')
        .eq('email', cleanEmail)
        .order('created_at', { ascending: false })

      if (existingInvitations && existingInvitations.length > 0) {
        const latestInvitation = existingInvitations[0]
        
        // Check for pending invitations
        if (latestInvitation.status === 'pending') {
          throw new Error('A pending invitation already exists for this email address. Please resend the existing invitation instead.')
        }
        
        // Check for recently declined invitations (within last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const invitationDate = new Date(latestInvitation.created_at)
        
        if (latestInvitation.status === 'declined' && invitationDate > thirtyDaysAgo) {
          throw new Error('This person recently declined an invitation. Please wait before sending another invitation.')
        }
        
        // Check for accepted invitations
        if (latestInvitation.status === 'accepted') {
          throw new Error('This person has already accepted an invitation but may not have completed registration. Please check the user list.')
        }
        
        // Check for different invitation type
        if (latestInvitation.invitation_type !== data.invitation_type) {
          throw new Error(`This email was previously invited as a ${latestInvitation.invitation_type}. Please ensure you're sending the correct invitation type.`)
        }
      }


      
      // Generate secure invitation token
      const invitationToken = generateUUID()
      
      // Calculate expiry date (7 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      console.log('🔧 Creating invitation record...')

      // Create invitation record
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .insert({
          email: cleanEmail,
          invitee_name: data.invitee_name?.trim() || null,
          invitation_type: data.invitation_type,
          invited_by: user.id,
          personal_message: data.personal_message?.trim() || null,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (invitationError) {
        console.error('❌ Error creating invitation:', invitationError)
        throw new Error(`Failed to create invitation: ${invitationError.message}`)
      }

      console.log('✅ Invitation created successfully:', invitation.id)

      // Create onboarding token with properly typed metadata
      console.log('🔧 Creating onboarding token...')
      const tokenMetadata: InvitationMetadata = {
        invited_by: user.id,
        invitee_name: data.invitee_name,
        created_at: new Date().toISOString(),
        invitation_attempt: 1 // Track first attempt
      }

      const { error: tokenError } = await supabase
        .from('onboarding_tokens')
        .insert({
          email: cleanEmail,
          token: invitationToken,
          user_type: data.invitation_type,
          invitation_id: invitation.id,
          expires_at: expiresAt.toISOString(),
          metadata: tokenMetadata
        })

      if (tokenError) {
        console.error('❌ Error creating onboarding token:', tokenError)
        
        // Clean up invitation if token creation fails
        await supabase
          .from('invitations')
          .delete()
          .eq('id', invitation.id)
        
        throw new Error(`Failed to create onboarding token: ${tokenError.message}`)
      }

      console.log('✅ Onboarding token created successfully')

      // Send FIRST-TIME invitation email
      console.log('📧 Sending first-time invitation email...')
      const emailResult = await emailService.sendFirstTimeInvitationEmail({
        email: data.email,
        inviteeName: data.invitee_name || 'there',
        invitationType: data.invitation_type,
        personalMessage: data.personal_message,
        invitationToken: invitationToken,
        inviterName: inviterName
      })

      console.log('📧 Email result:', emailResult)

      return {
        invitation,
        emailSent: emailResult.success,
        emailDemo: emailResult.demo || false,
        emailMethod: emailResult.method || 'unknown',
        emailError: emailResult.error
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      
      if (result.emailSent) {
        if (result.emailDemo) {
          toast.success('Demo invitation created!', {
            description: `Check the browser console for the simulated email content. Using ${result.emailMethod} method.`
          })
        } else {
          toast.success('Invitation sent successfully!', {
            description: `Email sent via ${result.emailMethod}. The recipient will receive registration instructions.`
          })
        }
      } else {
        toast.warning('Invitation created but email could not be sent', {
          description: 'The invitation was saved but there was an issue sending the email. You can try resending it later.'
        })
      }
    },
    onError: (error: Error) => {
      console.error('❌ Invitation creation failed:', error)
      toast.error('Failed to send invitation', {
        description: error.message
      })
    }
  })
}

// Enhanced resend invitation with reminder email
export const useResendInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('🔄 Resending invitation with reminder email:', invitationId)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to resend invitations.')
      }

      // Get user profile for inviter name
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const inviterName = userProfile?.full_name || user.email?.split('@')[0] || 'OIFYK Team'
      
      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (invitationError || !invitation) {
        console.error('❌ Error fetching invitation:', invitationError)
        throw new Error('Invitation not found')
      }

      if (invitation.status !== 'pending') {
        throw new Error('Can only resend pending invitations')
      }

      console.log('✅ Found invitation:', invitation.email)

      // Get existing onboarding token to check attempt count
      const { data: existingToken } = await supabase
        .from('onboarding_tokens')
        .select('*')
        .eq('invitation_id', invitationId)
        .single()

      let invitationToken = invitation.invitation_token
      let attemptCount = 1

      if (existingToken) {
        // Safely get metadata
        const currentMetadata = getMetadata(existingToken.metadata)
        attemptCount = (currentMetadata.invitation_attempt || 1) + 1
        
        // Check if token is expired, create new one
        if (new Date(existingToken.expires_at) < new Date()) {
          console.log('🔧 Token expired, creating new one...')
          invitationToken = generateUUID()
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 7)

          // Create updated metadata
          const updatedMetadata: InvitationMetadata = {
            ...currentMetadata,
            resent_by: user.id,
            resent_at: new Date().toISOString(),
            invitation_attempt: attemptCount
          }

          await supabase
            .from('onboarding_tokens')
            .update({
              token: invitationToken,
              expires_at: expiresAt.toISOString(),
              metadata: updatedMetadata
            })
            .eq('invitation_id', invitationId)

          await supabase
            .from('invitations')
            .update({ 
              invitation_token: invitationToken,
              updated_at: new Date().toISOString()
            })
            .eq('id', invitationId)
        } else {
          // Update attempt count on existing token
          const updatedMetadata: InvitationMetadata = {
            ...currentMetadata,
            resent_by: user.id,
            resent_at: new Date().toISOString(),
            invitation_attempt: attemptCount
          }

          await supabase
            .from('onboarding_tokens')
            .update({
              metadata: updatedMetadata
            })
            .eq('invitation_id', invitationId)
        }
      }

      // Send REMINDER email (different from first-time invitation)
      console.log('📧 Sending reminder email...')
      const emailResult = await emailService.sendReminderInvitationEmail({
        email: invitation.email,
        inviteeName: invitation.invitee_name || 'there',
        invitationType: invitation.invitation_type,
        personalMessage: invitation.personal_message,
        invitationToken: invitationToken,
        inviterName: inviterName,
        attemptCount: attemptCount
      })

      if (!emailResult.success && !emailResult.demo) {
        throw new Error(`Failed to resend invitation email via ${emailResult.method}`)
      }

      console.log('✅ Reminder invitation sent successfully via', emailResult.method)
      return { 
        success: true, 
        demo: emailResult.demo,
        method: emailResult.method,
        attemptCount: attemptCount
      }
    },
    onSuccess: (result) => {
      if (result.demo) {
        toast.success('Demo reminder sent!', {
          description: `Check the browser console for the simulated reminder email (attempt #${result.attemptCount}). Used ${result.method} method.`
        })
      } else {
        toast.success('Reminder sent successfully!', {
          description: `Reminder email sent via ${result.method} .`
        })
      }
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

// Hook to get all invitations with related data
export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      console.log('🔍 Fetching invitations...')
      
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          invited_by_user:users!invited_by(full_name, email),
          accepted_by_user:users!accepted_by(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching invitations:', error)
        throw error
      }

      console.log('✅ Fetched invitations:', data?.length || 0)
      return { data: data || [], error: null }
    }
  })
}

// Hook to get dashboard metrics from Supabase
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      console.log('📊 Fetching dashboard metrics...')

      try {
        // Execute multiple count queries in parallel
        const [
          usersResult,
          ownersResult, 
          propertiesResult,
          activePropertiesResult,
          bookingsResult
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'owner'),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('bookings').select('*', { count: 'exact', head: true })
        ])

        const metrics = {
          totalUsers: usersResult.count || 0,
          totalOwners: ownersResult.count || 0,
          totalProperties: propertiesResult.count || 0,
          activeProperties: activePropertiesResult.count || 0,
          totalBookings: bookingsResult.count || 0
        }

        console.log('✅ Dashboard metrics fetched:', metrics)
        return metrics

      } catch (error) {
        console.error('❌ Error fetching dashboard metrics:', error)
        // Return default values on error
        return {
          totalUsers: 0,
          totalOwners: 0,
          totalProperties: 0,
          activeProperties: 0,
          totalBookings: 0
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
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Error fetching recent activity:', error)
        return { data: [], error }
      }

      console.log('✅ Recent activity fetched:', data?.length || 0)
      return { data: data || [], error: null }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook to test email service connectivity
export const useTestEmailService = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      console.log('🧪 Testing email service connectivity...')
      
      const testResult = await emailService.sendInvitationEmail({
        email: email,
        inviteeName: 'Test User',
        invitationType: 'user',
        personalMessage: 'This is a test email to verify service connectivity.',
        invitationToken: 'test-token-' + Date.now(),
        inviterName: 'System Admin'
      })

      return testResult
    },
    onSuccess: (result) => {
      if (result.demo) {
        toast.success('Email service test completed (Demo Mode)', {
          description: `Test email simulated via ${result.method}. Check console for details.`
        })
      } else {
        toast.success('Email service test successful!', {
          description: `Test email sent via ${result.method}.`
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Email service test failed', {
        description: error.message
      })
    }
  })
}