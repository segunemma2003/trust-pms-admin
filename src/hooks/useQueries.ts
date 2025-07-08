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
    queryFn: async () => {
      const result = await userService.getUsers();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

export const useUsersByType = (userType: 'admin' | 'owner' | 'user') => {
  return useQuery({
    queryKey: ['users', userType],
    queryFn: async () => {
      const result = await userService.getUsersByType(userType);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

// Invitation Queries
export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const result = await invitationService.getInvitations();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (invitation: Parameters<typeof invitationService.createInvitation>[0]) => {
      const result = await invitationService.createInvitation(invitation);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      toast.success('Invitation sent successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`)
    },
  })
}

// Property Queries
export const useProperties = (filters?: Parameters<typeof propertyService.getProperties>[0]) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const result = await propertyService.getProperties(filters);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

export const useActiveProperties = () => {
  return useQuery({
    queryKey: ['properties', 'active'],
    queryFn: async () => {
      const result = await propertyService.getActiveProperties();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

export const usePropertiesByOwner = (ownerId?: string) => {
  return useQuery({
    queryKey: ['properties', 'owner', ownerId],
    queryFn: async () => {
      const result = await propertyService.getPropertiesByOwner(ownerId!);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!ownerId,
  })
}

export const usePropertiesByStatus = (status: 'draft' | 'pending_approval' | 'approved_pending_beds24' | 'active' | 'inactive' | 'suspended' | 'rejected') => {
  return useQuery({
    queryKey: ['properties', 'status', status],
    queryFn: async () => {
      const result = await propertyService.getPropertiesByStatus(status);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

export const useCreateProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (property: Parameters<typeof propertyService.createProperty>[0]) => {
      const result = await propertyService.createProperty(property);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property created successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create property: ${error.message}`)
    },
  })
}

export const useUpdateProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const result = await propertyService.updateProperty(id, updates);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update property: ${error.message}`)
    },
  })
}

export const useSubmitPropertyForApproval = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const result = await propertyService.submitForApproval(propertyId, user!.id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property submitted for approval!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit property: ${error.message}`)
    },
  })
}

export const useApproveProperty = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ propertyId, notes }: { propertyId: string; notes?: string }) => {
      const result = await propertyService.approveProperty(propertyId, user!.id, notes);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property approved successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve property: ${error.message}`)
    },
  })
}

export const useRejectProperty = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ propertyId, reason }: { propertyId: string; reason: string }) => {
      const result = await propertyService.rejectProperty(propertyId, user!.id, reason);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property rejected!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject property: ${error.message}`)
    },
  })
}

// Booking Queries
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const result = await bookingService.getBookings();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  })
}

export const useBookingsByGuest = (guestId?: string) => {
  return useQuery({
    queryKey: ['bookings', 'guest', guestId],
    queryFn: async () => {
      const result = await bookingService.getBookingsByGuest(guestId!);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!guestId,
  })
}

export const useBookingsByOwner = (ownerId?: string) => {
  return useQuery({
    queryKey: ['bookings', 'owner', ownerId],
    queryFn: async () => {
      const result = await bookingService.getBookingsByOwner(ownerId!);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!ownerId,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (booking: Parameters<typeof bookingService.createBooking>[0]) => {
      const result = await bookingService.createBooking(booking);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking created successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create booking: ${error.message}`)
    },
  })
}

// Analytics Queries
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const result = await analyticsService.getDashboardMetrics();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['analytics', 'activity', limit],
    queryFn: async () => {
      const result = await analyticsService.getRecentActivity(limit);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Revenue Analytics Query
export const useRevenueAnalytics = (filters: Parameters<typeof analyticsService.getRevenueAnalytics>[0]) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', filters],
    queryFn: async () => {
      const result = await analyticsService.getRevenueAnalytics(filters);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
    queryFn: async () => {
      const result = await invitationService.validateToken(token);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!token,
    retry: false,
  })
}