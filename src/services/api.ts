// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.oifyk.com/api'

// Types based on your API documentation
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  user_type: 'user' | 'owner' | 'admin'
  status: 'active' | 'inactive'
  trust_network_size?: number
  onboarding_completed: boolean
  date_joined: string
}

export interface Property {
  id: string
  title: string
  description: string
  address?: string
  city: string
  state: string
  country: string
  postal_code?: string
  latitude?: number
  longitude?: number
  display_price: number
  price_per_night?: number
  bedrooms: number
  bathrooms: number
  max_guests: number
  images: PropertyImage[]
  amenities: string[]
  status: 'draft' | 'active' | 'inactive'
  is_featured: boolean
  owner_name: string
  booking_count: number
  created_at: string
}

export interface PropertyImage {
  id: string
  image_url: string
  is_primary: boolean
  order: number
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  created_at: string
}

export interface Invitation {
  id: string
  email: string
  invitee_name: string
  invitation_type: 'user' | 'owner' | 'admin'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  personal_message?: string
  invited_by_name: string
  expires_at: string
  is_valid: boolean
  can_send_reminder: boolean
  days_until_expiry: number
  created_at: string
}

export interface DashboardMetrics {
  // For Owners
  my_properties_count?: number
  active_properties_count?: number
  total_bookings_count?: number
  upcoming_bookings_count?: number
  network_size?: number
  monthly_revenue?: number
  properties_by_status?: {
    draft: number
    active: number
    inactive: number
  }
  // For Admins
  total_users?: number
  total_owners?: number
  total_properties?: number
  active_properties?: number
  total_bookings?: number
  pending_approvals?: number
  recent_signups?: number
}

export interface Activity {
  id: string
  title: string
  description: string
  type: string
  user_name?: string
  timestamp: string
}

// API Client Class
class APIClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.loadTokens()
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token')
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  private saveTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      this.accessToken = access
      this.refreshToken = refresh
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      this.accessToken = null
      this.refreshToken = null
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken
        })
      })

      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.access
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access)
        }
        return true
      } else {
        this.clearTokens()
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearTokens()
      return false
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    console.log('Making API request to:', `${this.baseURL}`)
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
  const url = `${this.baseURL}/${normalizedEndpoint}`
  
  console.log('Making API request to:', url)
  console.log('Full URL composition:', {
    baseURL: this.baseURL,
    endpoint,
    normalizedEndpoint,
    finalURL: url
  })
    // DEBUG: Log the full URL being called
    console.log('🔍 API Call Details:', {
      endpoint,
      fullUrl: url,
      baseURL: this.baseURL,
      method: options.method || 'GET'
    })
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers
      })

      // DEBUG: Log response details
      console.log('📡 Response Details:', {
        status: response.status,
        url: response.url, // This shows the final URL after any redirects
        redirected: response.redirected,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Handle token refresh on 401
      if (response.status === 401 && this.refreshToken) {
        console.log('🔄 Attempting token refresh...')
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`
          response = await fetch(url, {
            ...options,
            headers
          })
          
          console.log('📡 Retry Response Details:', {
            status: response.status,
            url: response.url,
            redirected: response.redirected
          })
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.makeRequest<{ access: string; refresh: string }>('/auth/jwt/create/', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (response.data) {
      this.saveTokens(response.data.access, response.data.refresh)
    }

    return response
  }

  async register(userData: {
    email: string
    password: string
    password_confirm: string
    full_name: string
    phone?: string
    invitation_token: string
  }) {
    return this.makeRequest<{ message: string; user_id: string; user_type: string }>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async logout() {
    this.clearTokens()
  }

  // User methods
  async getCurrentUser() {
    return this.makeRequest<User>('/users/profile/')
  }

  async updateProfile(updates: { full_name?: string; phone?: string }) {
    return this.makeRequest<User>('/users/update_profile/', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async searchUsers(search?: string, userType?: string) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (userType) params.append('user_type', userType)
    
    return this.makeRequest<User[]>(`/users/search/?${params.toString()}`)
  }

  // Property methods
  async getProperties(filters?: {
    city?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    max_guests?: number
    page?: number
    page_size?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    return this.makeRequest<{
      count: number
      next?: string
      previous?: string
      results: Property[]
    }>(`/properties/?${params.toString()}`)
  }

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'owner_name' | 'booking_count' | 'is_featured'>) {
    return this.makeRequest<Property>('/properties/', {
      method: 'POST',
      body: JSON.stringify(property)
    })
  }

  async updateProperty(id: string, updates: Partial<Property>) {
    return this.makeRequest<Property>(`/properties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async checkAvailability(propertyId: string, data: {
    check_in_date: string
    check_out_date: string
    guests_count: number
  }) {
    return this.makeRequest<{
      available: boolean
      nights: number
      base_price: number
      discounted_price: number
      savings: number
      price_per_night: number
    }>(`/properties/${propertyId}/check_availability/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Booking methods
  async getBookings() {
    return this.makeRequest<{
      count: number
      results: Booking[]
    }>('/bookings/')
  }

  async createBooking(booking: {
    property: string
    check_in_date: string
    check_out_date: string
    guests_count: number
    special_requests?: string
  }) {
    return this.makeRequest<Booking>('/bookings/', {
      method: 'POST',
      body: JSON.stringify(booking)
    })
  }

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled') {
    return this.makeRequest<Booking>(`/bookings/${id}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  async getBookingStats(timeframe: 'week' | 'month' | 'year' = 'month') {
    return this.makeRequest<any>(`/bookings/stats/?timeframe=${timeframe}`)
  }

  // Invitation methods (Admin only)
  async getInvitations() {
    return this.makeRequest<{
      count: number
      results: Invitation[]
    }>('/invitations/')
  }

  async createInvitation(invitation: {
    email: string
    invitee_name: string
    invitation_type: 'user' | 'owner' | 'admin'
    personal_message?: string
  }) {
    return this.makeRequest<Invitation>('/invitations/', {
      method: 'POST',
      body: JSON.stringify(invitation)
    })
  }

  async validateInvitationToken(token: string) {
    return this.makeRequest<{
      valid: boolean
      invitation: {
        email: string
        invitee_name: string
        invitation_type: string
        inviter_name: string
        expires_at: string
        personal_message?: string
      }
    }>('/invitations/validate_token/', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  async acceptInvitation(token: string, userData?: {
    password: string
    full_name: string
    phone?: string
  }) {
    return this.makeRequest<any>('/invitations/accept_invitation/', {
      method: 'POST',
      body: JSON.stringify({
        token,
        ...(userData && { user_data: userData })
      })
    })
  }

  async declineInvitation(token: string) {
    return this.makeRequest<any>('/invitations/decline_invitation/', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  // Analytics methods
  async getDashboardMetrics() {
    return this.makeRequest<DashboardMetrics>('/analytics/dashboard_metrics/')
  }

  async getRecentActivity(limit: number = 10) {
    return this.makeRequest<Activity[]>(`/analytics/recent_activity/?limit=${limit}`)
  }

  async getRevenueAnalytics(filters: {
    start_date: string
    end_date: string
    group_by: 'day' | 'week' | 'month'
  }) {
    const params = new URLSearchParams(filters)
    return this.makeRequest<any>(`/analytics/revenue_analytics/?${params.toString()}`)
  }

  // File upload
  async uploadFile(file: File, folder?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)

    return this.makeRequest<{
      success: boolean
      file_url: string
      file_path: string
      original_name: string
      size: number
      content_type: string
    }>('/upload/', {
      method: 'POST',
      body: formData,
      headers: {} // Remove content-type header for FormData
    })
  }

  // Health check
  async healthCheck() {
    return this.makeRequest<{
      status: string
      timestamp: string
      services: Record<string, { status: string }>
    }>('/health/')
  }
}

// Create API client instance
const apiClient = new APIClient(API_BASE_URL)

// Service exports using the API client
export const userService = {
  getUsers: () => apiClient.searchUsers(),
  updateUser: (id: string, updates: Partial<User>) => apiClient.updateProfile(updates),
  getUsersByType: (userType: string) => apiClient.searchUsers(undefined, userType),
  getCurrentUser: () => apiClient.getCurrentUser()
}

export const authService = {
  login: (email: string, password: string) => apiClient.login(email, password),
  register: (userData: Parameters<typeof apiClient.register>[0]) => apiClient.register(userData),
  logout: () => apiClient.logout()
}

export const invitationService = {
  createInvitation: (invitation: Parameters<typeof apiClient.createInvitation>[0]) => 
    apiClient.createInvitation(invitation),
  
  createInvitationWithEmail: async (invitation: Parameters<typeof apiClient.createInvitation>[0], inviterName: string) => {
    const result = await apiClient.createInvitation(invitation)
    return {
      ...result,
      emailSent: true // Assume email is sent by API
    }
  },
  
  getInvitations: () => apiClient.getInvitations(),
  updateInvitation: (id: string, updates: Partial<Invitation>) => {
    // This would need to be implemented in the API
    console.warn('updateInvitation not implemented in API')
    return Promise.resolve({ data: null, error: 'Not implemented' })
  },
  
  validateToken: (token: string) => apiClient.validateInvitationToken(token),
  respondToInvitation: (token: string, action: 'accept' | 'reject') => {
    if (action === 'accept') {
      return apiClient.acceptInvitation(token)
    } else {
      return apiClient.declineInvitation(token)
    }
  },
  
  getInvitationByToken: (token: string) => apiClient.validateInvitationToken(token)
}

export const propertyService = {
  getProperties: (filters?: Parameters<typeof apiClient.getProperties>[0]) => 
    apiClient.getProperties(filters),
  
  getPropertiesByOwner: (ownerId: string) => {
    // This would need filtering by owner on the API side
    return apiClient.getProperties()
  },
  
  getActiveProperties: () => apiClient.getProperties(),
  
  getPropertiesByStatus: (status: string) => {
    // This would need filtering by status on the API side
    return apiClient.getProperties()
  },
  
  createProperty: (property: Parameters<typeof apiClient.createProperty>[0]) => 
    apiClient.createProperty(property),
  
  updateProperty: (id: string, updates: Partial<Property>) => 
    apiClient.updateProperty(id, updates),
  
  submitForApproval: (propertyId: string, submitterId: string) => {
    // This would need to be implemented in the API
    console.warn('submitForApproval not implemented in API')
    return Promise.resolve({ data: true, error: null })
  },
  
  approveProperty: (propertyId: string, adminId: string, notes?: string) => {
    // This would need to be implemented in the API
    console.warn('approveProperty not implemented in API')
    return Promise.resolve({ data: true, error: null })
  },
  
  rejectProperty: (propertyId: string, adminId: string, reason: string) => {
    // This would need to be implemented in the API
    console.warn('rejectProperty not implemented in API')
    return Promise.resolve({ data: true, error: null })
  }
}

export const bookingService = {
  getBookings: () => apiClient.getBookings(),
  
  getBookingsByGuest: (guestId: string) => {
    // This would need filtering by guest on the API side
    return apiClient.getBookings()
  },
  
  getBookingsByOwner: (ownerId: string) => {
    // This would need filtering by owner on the API side
    return apiClient.getBookings()
  },
  
  createBooking: (booking: Parameters<typeof apiClient.createBooking>[0]) => 
    apiClient.createBooking(booking),
  
  updateBooking: (id: string, updates: { status?: 'confirmed' | 'cancelled' }) => {
    if (updates.status) {
      return apiClient.updateBookingStatus(id, updates.status)
    }
    console.warn('Only status updates are supported')
    return Promise.resolve({ data: null, error: 'Only status updates supported' })
  }
}

export const analyticsService = {
  getDashboardMetrics: () => apiClient.getDashboardMetrics(),
  getRecentActivity: (limit = 10) => apiClient.getRecentActivity(limit),
  getRevenueAnalytics: (filters: Parameters<typeof apiClient.getRevenueAnalytics>[0]) => 
    apiClient.getRevenueAnalytics(filters)
}

// Export the API client for direct use
export { apiClient }




