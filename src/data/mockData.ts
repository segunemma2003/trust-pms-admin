
export const mockProperties = [
  {
    id: '1',
    title: 'Luxury Beach Villa',
    location: 'Malibu, California',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    price: 450,
    rating: 4.9,
    reviewCount: 142,
    trustLevel: 5 as const,
    discount: 15,
    beds: 4,
    baths: 3,
    sqft: 2800,
  },
  {
    id: '2',
    title: 'Downtown Apartment',
    location: 'New York, NY',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    price: 300,
    rating: 4.7,
    reviewCount: 98,
    trustLevel: 3 as const,
    discount: 0,
    beds: 2,
    baths: 2,
    sqft: 1200,
  },
  {
    id: '3',
    title: 'Mountain Retreat',
    location: 'Aspen, Colorado',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    price: 550,
    rating: 4.8,
    reviewCount: 76,
    trustLevel: 4 as const,
    discount: 10,
    beds: 5,
    baths: 4,
    sqft: 3500,
  },
  {
    id: '4',
    title: 'Cozy Lakeside Cottage',
    location: 'Lake Tahoe, Nevada',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    price: 375,
    rating: 4.6,
    reviewCount: 112,
    trustLevel: 2 as const,
    discount: 0,
    beds: 3,
    baths: 2,
    sqft: 1800,
  },
  {
    id: '5',
    title: 'Urban Loft',
    location: 'Chicago, Illinois',
    images: [
      'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617098650990-19b807d88f30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    price: 280,
    rating: 4.5,
    reviewCount: 87,
    trustLevel: 1 as const,
    discount: 0,
    beds: 1,
    baths: 1,
    sqft: 950,
  },
  {
    id: '6',
    title: 'Beachfront Bungalow',
    location: 'Miami, Florida',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    price: 420,
    rating: 4.7,
    reviewCount: 124,
    trustLevel: 4 as const,
    discount: 8,
    beds: 3,
    baths: 2,
    sqft: 1600,
  },
];

export const mockInvitations = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    status: 'pending',
    sentDate: '2025-05-10T10:30:00Z'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    status: 'accepted',
    sentDate: '2025-05-08T14:20:00Z',
    acceptedDate: '2025-05-09T09:15:00Z'
  },
  {
    id: '3',
    email: 'mike.johnson@example.com',
    name: 'Mike Johnson',
    status: 'pending',
    sentDate: '2025-05-12T08:45:00Z'
  },
  {
    id: '4',
    email: 'sarah.parker@example.com',
    name: 'Sarah Parker',
    status: 'expired',
    sentDate: '2025-04-25T16:10:00Z'
  }
];

export const mockTrustLevels = [
  {
    id: '1',
    name: 'Basic',
    level: 1,
    discount: 0,
    description: 'Default level for new users',
    criteria: 'New users with no booking history'
  },
  {
    id: '2',
    name: 'Standard',
    level: 2,
    discount: 5,
    description: 'Regular users with good history',
    criteria: 'At least 2 successful bookings'
  },
  {
    id: '3',
    name: 'Trusted',
    level: 3,
    discount: 10,
    description: 'Trusted guests with excellent reviews',
    criteria: 'At least 5 successful bookings with 4+ star reviews'
  },
  {
    id: '4',
    name: 'Premium',
    level: 4,
    discount: 15,
    description: 'Premium guests with long-term relationship',
    criteria: 'At least 10 successful bookings over 1+ year'
  },
  {
    id: '5',
    name: 'Elite',
    level: 5,
    discount: 20,
    description: 'VIP guests with exceptional status',
    criteria: 'Personal friends, family, or 20+ successful bookings'
  }
];

export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    type: 'owner',
    properties: 3,
    joined: '2025-01-15T00:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    type: 'owner',
    properties: 2,
    joined: '2025-02-20T00:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    type: 'user',
    joined: '2025-03-05T00:00:00Z',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sarah Parker',
    email: 'sarah.parker@example.com',
    type: 'user',
    joined: '2025-03-12T00:00:00Z',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Robert Davis',
    email: 'robert.davis@example.com',
    type: 'admin',
    joined: '2025-01-05T00:00:00Z',
    status: 'active'
  }
];

export const mockAnalytics = {
  totalProperties: 28,
  activeListings: 22,
  totalOwners: 12,
  totalBookings: 186,
  revenueData: [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 14200 },
    { month: 'Mar', revenue: 15800 },
    { month: 'Apr', revenue: 16900 },
    { month: 'May', revenue: 19200 }
  ],
  bookingsData: [
    { month: 'Jan', bookings: 32 },
    { month: 'Feb', bookings: 38 },
    { month: 'Mar', bookings: 41 },
    { month: 'Apr', bookings: 35 },
    { month: 'May', bookings: 40 }
  ],
  topProperties: [
    { id: '1', name: 'Luxury Beach Villa', bookings: 24 },
    { id: '3', name: 'Mountain Retreat', bookings: 21 },
    { id: '6', name: 'Beachfront Bungalow', bookings: 19 }
  ]
};
