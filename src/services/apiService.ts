// Custom API Service - Based on OnlyIfYouKnow API Documentation
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-domain.com/api'

// Types based on API documentation
export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  user_type: 'admin' | 'owner' | 'user'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  trust_network_size?: number
  onboarding_completed: boolean
  date_joined: string
}

export interface Property {
  id: string
  title: string
  description: string
  city: string
  state: string
  country: string
  display_price: number
  bedrooms: number
  bathrooms: number
  max_guests: number
  images: Array<{
    id: string
    image_url: string
    is_primary: boolean
    order: number
  }>
  amenities: string[]
  status: 'active' | 'inactive' | 'draft'
  is_featured: boolean
  owner_name: string
  booking_count: number
  created_at: string
}

export interface Invitation {
  id: string
  email: string
  invitee_name: string
  invitation_type: 'user' | 'owner' | 'admin'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  personal_message: string
  invited_by_name: string
  expires_at: string
  is_valid: boolean
  can_send_reminder: boolean
  days_until_expiry: number
  created_at: string
}

export interface Booking {
  id: string
  property: string
  property_details: {
    title: string
    city: string
  }
  guest: string
  guest_name: string
  guest_email: string
  check_in_date: string
  check_out_date: string
  nights: number
  guests_count: number
  total_amount: number
  original_price: number
  discount_applied: number
  status: 'confirmed' | 'pending' | 'cancelled'
  special_requests: string
  created_at: string
}

export interface DashboardMetrics {
  total_users: number
  total_owners: number
  total_properties: number
  active_properties: number
  total_bookings: number
  pending_approvals: number
  recent_signups: number
  monthly_revenue: number
}

// HTTP Client with automatic token handling
class APIClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        return { data: null, error: errorData }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return { data: null, error }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<{ data: T | null; error: any }> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, body?: any): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async patch<T>(endpoint: string, body?: any): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const apiClient = new APIClient()

// User Services
export const userService = {
  // Search users with filters
  searchUsers: async (params: {
    search?: string
    user_type?: 'user' | 'owner' | 'admin'
    page?: number
    page_size?: number
  } = {}) => {
    return apiClient.get<{ count: number; results: User[] }>('/users/search/', params)
  },

  // Get current user profile
  getCurrentProfile: async () => {
    return apiClient.get<User>('/users/profile/')
  },

  // Update current user profile
  updateProfile: async (updates: Partial<User>) => {
    return apiClient.patch<User>('/users/update_profile/', updates)
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiClient.post('/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword
    })
  }
}

// Property Services
export const propertyService = {
  // List all properties with filters
  getProperties: async (params: {
    city?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    max_guests?: number
    page?: number
    page_size?: number
  } = {}) => {
    return apiClient.get<{ count: number; results: Property[] }>('/properties/', params)
  },

  // Get property details
  getProperty: async (propertyId: string) => {
    return apiClient.get<Property>(`/properties/${propertyId}/`)
  },

  // Create new property
  createProperty: async (propertyData: {
    title: string
    description: string
    address: string
    city: string
    state: string
    country: string
    postal_code: string
    latitude?: number
    longitude?: number
    price_per_night: number
    bedrooms: number
    bathrooms: number
    max_guests: number
    images: string[]
    amenities: string[]
    is_visible: boolean
  }) => {
    return apiClient.post<Property>('/properties/', propertyData)
  },

  // Update property
  updateProperty: async (propertyId: string, updates: Partial<Property>) => {
    return apiClient.patch<Property>(`/properties/${propertyId}/`, updates)
  },

  // Toggle property visibility
  toggleVisibility: async (propertyId: string, isVisible: boolean) => {
    return apiClient.patch(`/properties/${propertyId}/toggle_visibility/`, {
      is_visible: isVisible
    })
  },

  // Check property availability
  checkAvailability: async (propertyId: string, params: {
    check_in_date: string
    check_out_date: string
    guests_count: number
  }) => {
    return apiClient.post(`/properties/${propertyId}/check_availability/`, params)
  }
}

// Booking Services
export const bookingService = {
  // Get all bookings
  getBookings: async (params: { page?: number; page_size?: number } = {}) => {
    return apiClient.get<{ count: number; results: Booking[] }>('/bookings/', params)
  },

  // Create new booking
  createBooking: async (bookingData: {
    property: string
    check_in_date: string
    check_out_date: string
    guests_count: number
    special_requests?: string
  }) => {
    return apiClient.post<Booking>('/bookings/', bookingData)
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    return apiClient.patch(`/bookings/${bookingId}/update_status/`, { status })
  },

  // Cancel booking
  cancelBooking: async (bookingId: string) => {
    return apiClient.post(`/bookings/${bookingId}/cancel/`)
  },

  // Complete booking (owner only)
  completeBooking: async (bookingId: string) => {
    return apiClient.post(`/bookings/${bookingId}/complete/`)
  },

  // Get booking statistics
  getBookingStats: async (timeframe: 'week' | 'month' | 'year' = 'month') => {
    return apiClient.get('/bookings/stats/', { timeframe })
  }
}

// Invitation Services
export const invitationService = {
  // Get all invitations
  getInvitations: async (params: { page?: number; page_size?: number } = {}) => {
    return apiClient.get<{ count: number; results: Invitation[] }>('/invitations/', params)
  },

  // Create new invitation
  createInvitation: async (invitationData: {
    email: string
    invitee_name: string
    invitation_type: 'user' | 'owner' | 'admin'
    personal_message?: string
  }) => {
    return apiClient.post<Invitation>('/invitations/', invitationData)
  },

  // Validate invitation token
  validateToken: async (token: string) => {
    return apiClient.post('/invitations/validate_token/', { token })
  },

  // Accept invitation
  acceptInvitation: async (token: string, userData?: {
    password: string
    full_name: string
    phone: string
  }) => {
    return apiClient.post('/invitations/accept_invitation/', {
      token,
      ...(userData && { user_data: userData })
    })
  },

  // Decline invitation
  declineInvitation: async (token: string) => {
    return apiClient.post('/invitations/decline_invitation/', { token })
  }
}

// Analytics Services (Admin only)
export const analyticsService = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    return apiClient.get<DashboardMetrics>('/analytics/dashboard_metrics/')
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10) => {
    return apiClient.get('/analytics/recent_activity/', { limit: limit.toString() })
  },

  // Get revenue analytics
  getRevenueAnalytics: async (params: {
    start_date: string
    end_date: string
    group_by: 'day' | 'week' | 'month'
  }) => {
    return apiClient.get('/analytics/revenue_analytics/', params)
  },

  // Get system statistics (Admin only)
  getSystemStats: async () => {
    return apiClient.get('/analytics/system_stats/')
  }
}

// Notification Services
export const notificationService = {
  // Get notifications
  getNotifications: async (unreadOnly: boolean = false) => {
    return apiClient.get('/notifications/', unreadOnly ? { unread_only: 'true' } : {})
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiClient.patch(`/notifications/${notificationId}/mark_read/`)
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiClient.patch('/notifications/mark_all_read/')
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiClient.get('/notifications/unread_count/')
  }
}

// File Upload Services
export const uploadService = {
  // Upload file
  uploadFile: async (file: File, folder: string = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const token = localStorage.getItem('access_token')
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete file
  deleteFile: async (filePath: string) => {
    return apiClient.delete('/upload/delete/', { file_path: filePath })
  }
}

// Health Check
export const healthService = {
  checkSystemHealth: async () => {
    return apiClient.get('/health/')
  }
}