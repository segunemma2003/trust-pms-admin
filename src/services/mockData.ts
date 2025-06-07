export const mockDashboardMetrics = {
  totalUsers: 1247,
  totalOwners: 89,
  totalProperties: 156,
  activeProperties: 142,
  totalBookings: 2891
}

export const mockInvitations = [
  {
    id: 'mock-inv-1',
    email: 'john.doe@example.com',
    invitee_name: 'John Doe',
    invitation_type: 'owner',
    status: 'pending',
    personal_message: 'Welcome to our platform!',
    invited_by: 'anonymous-admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-inv-2',
    email: 'jane.smith@example.com',
    invitee_name: 'Jane Smith',
    invitation_type: 'owner',
    status: 'accepted',
    personal_message: null,
    invited_by: 'anonymous-admin',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-inv-3',
    email: 'mike.wilson@example.com',
    invitee_name: 'Mike Wilson',
    invitation_type: 'user',
    status: 'pending',
    personal_message: 'Join us for great experiences!',
    invited_by: 'anonymous-admin',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
]

export const mockProperties = [
  {
    id: 'mock-prop-1',
    owner_id: 'anonymous-owner',
    title: 'Luxury Downtown Apartment',
    description: 'Beautiful 2-bedroom apartment in the heart of the city',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    price_per_night: 250,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    status: 'active',
    beds24_property_id: 'beds24-123',
    images: ['/api/placeholder/400/300'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-prop-2',
    owner_id: 'anonymous-owner',
    title: 'Cozy Mountain Cabin',
    description: 'Perfect getaway in the mountains with stunning views',
    address: '456 Pine Road',
    city: 'Lake Tahoe',
    state: 'CA',
    country: 'USA',
    price_per_night: 180,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    status: 'pending_approval',
    beds24_property_id: null,
    images: ['/api/placeholder/400/300'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-prop-3',
    owner_id: 'other-owner',
    title: 'Beach House Paradise',
    description: 'Oceanfront property with private beach access',
    address: '789 Ocean Drive',
    city: 'Malibu',
    state: 'CA',
    country: 'USA',
    price_per_night: 450,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    status: 'active',
    beds24_property_id: 'beds24-456',
    images: ['/api/placeholder/400/300'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
]

export const mockBookings = [
  {
    id: 'mock-booking-1',
    property_id: 'mock-prop-1',
    guest_id: 'anonymous-user',
    check_in_date: '2024-07-15',
    check_out_date: '2024-07-20',
    guests_count: 2,
    total_amount: 1250,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    property: {
      title: 'Luxury Downtown Apartment',
      address: '123 Main Street',
      city: 'San Francisco'
    }
  },
  {
    id: 'mock-booking-2',
    property_id: 'mock-prop-3',
    guest_id: 'anonymous-user',
    check_in_date: '2024-08-01',
    check_out_date: '2024-08-05',
    guests_count: 4,
    total_amount: 1800,
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    property: {
      title: 'Beach House Paradise',
      address: '789 Ocean Drive',
      city: 'Malibu'
    }
  }
]

export const mockUsers = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    full_name: 'Alice Johnson',
    user_type: 'user',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    full_name: 'Bob Smith',
    user_type: 'owner',
    status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'user-3',
    email: 'carol@example.com',
    full_name: 'Carol Davis',
    user_type: 'user',
    status: 'pending',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

export const mockActivity = [
  {
    id: 'activity-1',
    action: 'user_signup_from_invitation',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    user: {
      full_name: 'Alice Johnson'
    }
  },
  {
    id: 'activity-2',
    action: 'property_submitted_for_approval',
    user_id: 'anonymous-owner',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      full_name: 'Demo Property Owner'
    }
  },
  {
    id: 'activity-3',
    action: 'invitation_created',
    user_id: 'anonymous-admin',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: {
      full_name: 'Demo Administrator'
    }
  },
  {
    id: 'activity-4',
    action: 'booking_created',
    user_id: 'anonymous-user',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    user: {
      full_name: 'Demo User'
    }
  },
  {
    id: 'activity-5',
    action: 'property_approved',
    user_id: 'anonymous-admin',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    user: {
      full_name: 'Demo Administrator'
    }
  }
]