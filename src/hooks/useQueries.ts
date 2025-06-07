import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  userService, 
  invitationService, 
  propertyService, 
  bookingService, 
  analyticsService 
} from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// User Queries
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  })
}

export const useUsersByType = (userType: 'admin' | 'owner' | 'user') => {
  return useQuery({
    queryKey: ['users', userType],
    queryFn: () => userService.getUsersByType(userType),
  })
}

// Invitation Queries
export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: invitationService.getInvitations,
  })
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: invitationService.createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      toast.success('Invitation sent successfully!')
    },
    onError: (error: any) => {
      toast.error(`Failed to send invitation: ${error.message}`)
    },
  })
}

// Property Queries
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getProperties,
  })
}

export const useActiveProperties = () => {
  return useQuery({
    queryKey: ['properties', 'active'],
    queryFn: propertyService.getActiveProperties,
  })
}

export const usePropertiesByOwner = (ownerId?: string) => {
  return useQuery({
    queryKey: ['properties', 'owner', ownerId],
    queryFn: () => propertyService.getPropertiesByOwner(ownerId!),
    enabled: !!ownerId,
  })
}

export const usePropertiesByStatus = (status: 'draft' | 'pending_approval' | 'approved_pending_beds24' | 'active' | 'inactive' | 'suspended' | 'rejected') => {
  return useQuery({
    queryKey: ['properties', 'status', status],
    queryFn: () => propertyService.getPropertiesByStatus(status),
  })
}

export const useCreateProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: propertyService.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property created successfully!')
    },
    onError: (error: any) => {
      toast.error(`Failed to create property: ${error.message}`)
    },
  })
}

export const useUpdateProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      propertyService.updateProperty(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property updated successfully!')
    },
    onError: (error: any) => {
      toast.error(`Failed to update property: ${error.message}`)
    },
  })
}

export const useSubmitPropertyForApproval = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (propertyId: string) => 
      propertyService.submitForApproval(propertyId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property submitted for approval!')
    },
    onError: (error: any) => {
      toast.error(`Failed to submit property: ${error.message}`)
    },
  })
}

export const useApproveProperty = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ propertyId, notes }: { propertyId: string; notes?: string }) => 
      propertyService.approveProperty(propertyId, user!.id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property approved successfully!')
    },
    onError: (error: any) => {
      toast.error(`Failed to approve property: ${error.message}`)
    },
  })
}

export const useRejectProperty = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ propertyId, reason }: { propertyId: string; reason: string }) => 
      propertyService.rejectProperty(propertyId, user!.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property rejected!')
    },
    onError: (error: any) => {
      toast.error(`Failed to reject property: ${error.message}`)
    },
  })
}

// Booking Queries
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: bookingService.getBookings,
  })
}

export const useBookingsByGuest = (guestId?: string) => {
  return useQuery({
    queryKey: ['bookings', 'guest', guestId],
    queryFn: () => bookingService.getBookingsByGuest(guestId!),
    enabled: !!guestId,
  })
}

export const useBookingsByOwner = (ownerId?: string) => {
  return useQuery({
    queryKey: ['bookings', 'owner', ownerId],
    queryFn: () => bookingService.getBookingsByOwner(ownerId!),
    enabled: !!ownerId,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking created successfully!')
    },
    onError: (error: any) => {
      toast.error(`Failed to create booking: ${error.message}`)
    },
  })
}

// Analytics Queries
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsService.getDashboardMetrics,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['analytics', 'activity', limit],
    queryFn: () => analyticsService.getRecentActivity(limit),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Custom hooks for specific use cases
export const useOwnerProperties = () => {
  const { user } = useAuth()
  return usePropertiesByOwner(user?.id)
}

export const useUserBookings = () => {
  const { user } = useAuth()
  return useBookingsByGuest(user?.id)
}

export const useOwnerBookings = () => {
  const { user } = useAuth()
  return useBookingsByOwner(user?.id)
}

// Validation hook for onboarding
export const useValidateOnboardingToken = (token: string) => {
  return useQuery({
    queryKey: ['validate-token', token],
    queryFn: () => invitationService.validateToken(token),
    enabled: !!token,
    retry: false,
  })
}