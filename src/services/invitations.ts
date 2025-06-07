import { supabase } from '@/lib/supabase'
import { emailService } from './email'
import type { Database } from '@/lib/database.types'

type InvitationInsert = Database['public']['Tables']['invitations']['Insert']

// Helper to check if user is anonymous
const isAnonymousUser = () => {
  return typeof window !== 'undefined' && !!localStorage.getItem('anonymous_user')
}

export const invitationService = {
  // Get all invitations with related data
  getInvitations: async () => {
    if (isAnonymousUser()) {
      // Return mock data for anonymous users
      return {
        data: [
          {
            id: 'mock-inv-1',
            email: 'john.doe@example.com',
            invitee_name: 'John Doe',
            invitation_type: 'owner' as const,
            status: 'pending' as const,
            personal_message: 'Welcome to our platform!',
            invited_by: 'anonymous-admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            invited_by_user: {
              full_name: 'Demo Admin',
              email: 'admin@demo.com'
            }
          }
        ],
        error: null
      }
    }

    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        invited_by_user:users!invited_by(full_name, email),
        accepted_by_user:users!accepted_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Create basic invitation (without email)
  createInvitation: async (invitation: InvitationInsert) => {
    if (isAnonymousUser()) {
      // For demo, just return success
      const newInvitation = {
        id: `mock-inv-${Date.now()}`,
        ...invitation,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { data: newInvitation, error: null }
    }

    try {
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .insert(invitation)
        .select()
        .single()

      if (invitationError) {
        throw invitationError
      }

      return {
        data: invitationData,
        error: null
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      return {
        data: null,
        error
      }
    }
  },

  // Create invitation and send email
  createInvitationWithEmail: async (
    invitation: InvitationInsert,
    inviterName: string
  ) => {
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
        emailDemo: true,
        error: null 
      }
    }

    try {
      // 1. Create invitation in database
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .insert(invitation)
        .select()
        .single()

      if (invitationError) {
        throw invitationError
      }

      // 2. Create onboarding token
      const tokenExpiry = new Date()
      tokenExpiry.setDate(tokenExpiry.getDate() + 7) // 7 days from now

      const { data: tokenData, error: tokenError } = await supabase
        .from('onboarding_tokens')
        .insert({
          email: invitation.email,
          user_type: invitation.invitation_type || 'owner',
          invitation_id: invitationData.id,
          expires_at: tokenExpiry.toISOString(),
          metadata: {
            invited_by: invitation.invited_by,
            invitee_name: invitation.invitee_name,
            created_at: new Date().toISOString()
          }
        })
        .select('token')
        .single()

      if (tokenError) {
        console.error('Token creation error:', tokenError)
        // Clean up invitation if token creation fails
        await supabase
          .from('invitations')
          .delete()
          .eq('id', invitationData.id)
        throw tokenError
      }

      // 3. Update invitation with token
      await supabase
        .from('invitations')
        .update({ invitation_token: tokenData.token })
        .eq('id', invitationData.id)

      // 4. Send email with invitation
      const emailResult = await emailService.sendInvitationEmail({
        recipientEmail: invitation.email,
        recipientName: invitation.invitee_name || 'there',
        inviterName,
        personalMessage: invitation.personal_message || undefined,
        invitationToken: tokenData.token,
        invitationType: invitation.invitation_type || 'owner'
      })

      if (!emailResult.success && !emailResult.demo) {
        console.error('Failed to send invitation email:', emailResult.error)
      }

      return {
        data: invitationData,
        emailSent: emailResult.success,
        emailDemo: emailResult.demo || false,
        error: null
      }

    } catch (error) {
      console.error('Error creating invitation with email:', error)
      return {
        data: null,
        emailSent: false,
        error
      }
    }
  },

  // Update invitation status
  updateInvitation: async (id: string, updates: Partial<Database['public']['Tables']['invitations']['Update']>) => {
    if (isAnonymousUser()) {
      return { 
        data: { id, ...updates }, 
        error: null 
      }
    }

    const { data, error } = await supabase
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Validate onboarding token - NO RPC FUNCTION NEEDED
  validateToken: async (token: string) => {
    console.log('🔍 Validating token:', token.substring(0, 8) + '...')
    
    if (isAnonymousUser()) {
      console.log('✅ Anonymous user - returning mock validation')
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
      // Use regular query instead of RPC
      console.log('🔍 Querying onboarding_tokens table...')
      const { data: tokenData, error } = await supabase
        .from('onboarding_tokens')
        .select('*')
        .eq('token', token)
        .single()

      console.log('📊 Token query result:', { hasData: !!tokenData, error: error?.message })

      if (error || !tokenData) {
        console.log('❌ Token not found or error occurred')
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
      })

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
      console.error('❌ Error validating token:', error)
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

  // Respond to invitation - NO RPC FUNCTION NEEDED
  respondToInvitation: async (token: string, action: 'accept' | 'reject') => {
    try {
      if (isAnonymousUser()) {
        return {
          success: true,
          action: action === 'accept' ? 'accepted' : 'rejected',
          message: action === 'accept' 
            ? 'Demo invitation accepted!' 
            : 'Demo invitation declined.',
          tokenInfo: {
            user_type: 'owner',
            email: 'demo@example.com',
            invitation_id: 'mock-invitation',
            token: token
          }
        }
      }

      // 1. Get and validate token using regular query
      const { data: tokenData, error: tokenError } = await supabase
        .from('onboarding_tokens')
        .select('*')
        .eq('token', token)
        .single()

      if (tokenError || !tokenData) {
        return {
          success: false,
          error: 'Invalid invitation token'
        }
      }

      // Check if token is valid
      const now = new Date()
      const expiresAt = new Date(tokenData.expires_at)
      const isValid = expiresAt > now && !tokenData.used_at

      if (!isValid) {
        return {
          success: false,
          error: 'This invitation has expired or has already been used'
        }
      }

      if (action === 'reject') {
        // Update invitation status to declined
        const { error: updateError } = await supabase
          .from('invitations')
          .update({
            status: 'declined',
            updated_at: new Date().toISOString()
          })
          .eq('id', tokenData.invitation_id)

        if (updateError) {
          throw updateError
        }

        // Mark token as used
        await supabase
          .from('onboarding_tokens')
          .update({
            used_at: new Date().toISOString()
          })
          .eq('id', tokenData.id)

        return {
          success: true,
          action: 'rejected',
          message: 'Thank you for your response. The invitation has been declined.'
        }
      }

      if (action === 'accept') {
        // For accept, we return success and let the onboarding flow handle the rest
        return {
          success: true,
          action: 'accepted',
          tokenInfo: {
            user_type: tokenData.user_type,
            email: tokenData.email,
            invitation_id: tokenData.invitation_id,
            token: token
          },
          message: 'Invitation accepted! Please complete your registration.'
        }
      }

      return {
        success: false,
        error: 'Invalid action'
      }

    } catch (error) {
      console.error('Error responding to invitation:', error)
      return {
        success: false,
        error: 'An error occurred while processing your response'
      }
    }
  },

  // Get invitation by token
  getInvitationByToken: async (token: string) => {
    if (isAnonymousUser()) {
      return {
        data: {
          id: 'demo-token',
          token: token,
          email: 'demo@example.com',
          user_type: 'owner' as const,
          invitation_id: 'mock-invitation',
          invitation: {
            id: 'mock-invitation',
            email: 'demo@example.com',
            invitee_name: 'Demo User',
            invitation_type: 'owner' as const,
            personal_message: 'Welcome to our demo platform!',
            inviter: {
              full_name: 'Demo Admin',
              email: 'admin@demo.com'
            }
          }
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
  },

  // Resend invitation email
  resendInvitation: async (invitationId: string, inviterName: string) => {
    if (isAnonymousUser()) {
      return {
        success: true,
        emailDemo: true,
        error: null
      }
    }

    try {
      // 1. Get the invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (invitationError || !invitationData) {
        throw new Error('Invitation not found')
      }

      // 2. Check if invitation is still pending
      if (invitationData.status !== 'pending') {
        throw new Error('Can only resend pending invitations')
      }

      // 3. Get the token
      const { data: tokenData, error: tokenError } = await supabase
        .from('onboarding_tokens')
        .select('token')
        .eq('invitation_id', invitationId)
        .single()

      if (tokenError || !tokenData) {
        throw new Error('Invitation token not found')
      }

      // 4. Send email
      const emailResult = await emailService.sendInvitationEmail({
        recipientEmail: invitationData.email,
        recipientName: invitationData.invitee_name || 'there',
        inviterName,
        personalMessage: invitationData.personal_message || undefined,
        invitationToken: tokenData.token,
        invitationType: invitationData.invitation_type || 'owner'
      })

      return {
        success: emailResult.success,
        emailDemo: emailResult.demo || false,
        error: emailResult.success ? null : emailResult.error
      }

    } catch (error) {
      console.error('Error resending invitation:', error)
      return {
        success: false,
        error
      }
    }
  }
}