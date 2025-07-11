// API Configuration
const API_BASE_URL ="https://api.oifyk.com/api"

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
  email_verified?: boolean
  last_active_at?: string
  created_at?: string
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
  owner: string
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
  task_id: any
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
  reminder_count?: number
  last_reminder_sent?: string
  created_at: string
}

export interface OwnerWithStats extends User {
  properties_count: number
  active_properties_count: number
  total_bookings: number
  total_revenue: number
  last_active_at?: string
}

export interface OwnerPropertyStats {
  owner_id: string
  properties_count: number
  active_properties_count: number
  property_statuses: {
    draft: number
    active: number
    inactive: number
    pending_approval: number
  }
}

// New type for resend response
export interface ResendInvitationResponse {
  message: string
  invitation_id: string
  task_id: string
  reminder_count: number
  can_send_more: boolean
  next_reminder_available_at?: string
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
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Always get the latest tokens from localStorage
  private getCurrentTokens() {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token')
      }
    }
    return { accessToken: null, refreshToken: null }
  }

  private saveTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    const { refreshToken } = this.getCurrentTokens()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken
        })
      })

      if (response.ok) {
        const data = await response.json()
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

  // Make this method public so it can be used in hooks
  public async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    const url = `${this.baseURL}${endpoint}`
    
    // Always get the current tokens from localStorage
    const { accessToken, refreshToken } = this.getCurrentTokens()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers
      })

      // Handle token refresh on 401
      if (response.status === 401 && refreshToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Get the new token and retry the request
          const { accessToken: newAccessToken } = this.getCurrentTokens()
          headers['Authorization'] = `Bearer ${newAccessToken}`
          response = await fetch(url, {
            ...options,
            headers
          })
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
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

  async updateProfile(updates: { full_name?: string; phone?: string; status?: string }) {
    return this.makeRequest<User>('/users/update_profile/', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async updateUserById(userId: string, updates: Partial<User>) {
    return this.makeRequest<User>(`/users/${userId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async searchUsers(search?: string, userType?: string) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (userType) params.append('user_type', userType)
    
    return this.makeRequest<{
      count: number
      next?: string
      previous?: string
      results: User[]
    }>(`/users/search/?${params.toString()}`)
  }

  // Owner-specific methods
  async getOwners(params?: {
    search?: string
    status?: string
    page?: number
    page_size?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    
    // Add user_type filter for owners
    searchParams.append('user_type', 'owner')
    
    return this.makeRequest<{
      count: number
      next?: string
      previous?: string
      results: User[]
    }>(`/users/search/?${searchParams.toString()}`)
  }

  async getOwnerStats(ownerId: string) {
    return this.makeRequest<{
      properties_count: number
      active_properties_count: number
      total_bookings: number
      total_revenue: number
      recent_bookings: number
      approval_rate: number
    }>(`/analytics/owner_stats/?owner_id=${ownerId}`)
  }

  async getAllOwnersWithStats() {
    return this.makeRequest<{
      count: number
      results: OwnerWithStats[]
    }>('/users/owners_with_stats/')
  }

  // Property methods
  async getProperties(filters?: {
    city?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    max_guests?: number
    status?: string
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



   async getPropertyById(id: string) {
  // This should return a single Property, not a paginated response
  return this.makeRequest<Property>(`/properties/${id}/`)
}

  async getPropertiesByOwner(ownerId: string, status?: string) {
    const params = new URLSearchParams({ owner_id: ownerId })
    if (status) params.append('status', status)
    
    return this.makeRequest<{
      count: number
      owner: {
        id: string
        full_name: string
        email: string
        properties_count: number
      }
      results: Property[]
    }>(`/properties/by_owner/?${params.toString()}`)
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

  // Resend invitation by ID
  async resendInvitation(invitationId: string) {
    return this.makeRequest<ResendInvitationResponse>(`/invitations/${invitationId}/resend_invitation/`, {
      method: 'POST'
    })
  }

  // Resend invitation by email
  async resendInvitationByEmail(email: string, invitationType: 'user' | 'owner' | 'admin' = 'user') {
    return this.makeRequest<ResendInvitationResponse>('/invitations/resend_by_email/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        invitation_type: invitationType
      })
    })
  }

  // Check task status
  async checkTaskStatus(taskId: string) {
    return this.makeRequest<{
      task_id: string
      state: string
      ready: boolean
      successful?: boolean
      result?: any
      error?: string
      traceback?: string
      workers_active: boolean
      active_workers: string[]
    }>(`/invitations/check_task_status/?task_id=${taskId}`)
  }

  // Check Celery status
  async checkCeleryStatus() {
    return this.makeRequest<{
      status: string
      workers: string[]
      active_tasks: number
      worker_count: number
    }>('/invitations/celery_status/')
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

  // Messaging methods
  async sendMessage(recipientId: string, subject: string, message: string) {
    return this.makeRequest<{ message: string; sent: boolean }>('/notifications/send_message/', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: recipientId,
        subject,
        message
      })
    })
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
  updateUser: (id: string, updates: Partial<User>) => apiClient.updateUserById(id, updates),
  getUsersByType: (userType: string) => apiClient.searchUsers(undefined, userType),
  getCurrentUser: () => apiClient.getCurrentUser(),
  getOwners: (params?: Parameters<typeof apiClient.getOwners>[0]) => 
    apiClient.getOwners(params),
  getOwnersWithStats: () => apiClient.getAllOwnersWithStats(),
  getOwnerStats: (ownerId: string) => apiClient.getOwnerStats(ownerId),
  
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
  
  resendInvitation: (invitationId: string) => apiClient.resendInvitation(invitationId),
  
  resendInvitationByEmail: (email: string, invitationType: 'user' | 'owner' | 'admin' = 'user') => 
    apiClient.resendInvitationByEmail(email, invitationType),
  
  checkTaskStatus: (taskId: string) => apiClient.checkTaskStatus(taskId),
  checkCeleryStatus: () => apiClient.checkCeleryStatus(),
  
  updateInvitation: (id: string, updates: Partial<Invitation>) => {
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
  
  getPropertiesByOwner: (ownerId: string, status?: string) => 
    apiClient.getPropertiesByOwner(ownerId, status),
  
  getActiveProperties: () => apiClient.getProperties({ status: 'active' }),
  
  getPropertiesByStatus: (status: string) => 
    apiClient.getProperties({ status }),

  getPropertyById: (id: string) => 
    apiClient.getPropertyById( id ),
  
  createProperty: (property: Parameters<typeof apiClient.createProperty>[0]) => 
    apiClient.createProperty(property),
  
  updateProperty: (id: string, updates: Partial<Property>) => 
    apiClient.updateProperty(id, updates),
  
  submitForApproval: (propertyId: string, submitterId: string) => {
    return apiClient.makeRequest<any>(`/properties/${propertyId}/submit_for_approval/`, {
      method: 'POST',
      body: JSON.stringify({ submitted_by: submitterId })
    })
  },
  
  approveProperty: (propertyId: string, adminId: string, notes?: string) => {
    return apiClient.makeRequest<any>(`/properties/${propertyId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ approved_by: adminId, notes })
    })
  },
  
  rejectProperty: (propertyId: string, adminId: string, reason: string) => {
    return apiClient.makeRequest<any>(`/properties/${propertyId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ rejected_by: adminId, reason })
    })
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

export const messageService = {
  sendMessage: (recipientId: string, subject: string, message: string) =>
    apiClient.sendMessage(recipientId, subject, message)
}

// Export the API client for direct use
export { apiClient }