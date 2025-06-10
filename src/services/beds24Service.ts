interface Beds24AuthResponse {
  token: string;
  expiresIn: number;
  refreshToken: string;
}

interface Beds24Property {
  id?: number;
  name: string;
  propertyType: 'hotel' | 'apartment' | 'house' | 'villa' | 'hostel' | 'b&b' | 'other';
  currency: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  checkinTime?: string;
  checkoutTime?: string;
  minAge?: number;
  maxOccupancy?: number;
  roomTypes?: Beds24RoomType[];
}

interface Beds24RoomType {
  id?: number;
  name: string;
  qty?: number;
  minPrice?: number;
  maxOccupancy?: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface Beds24CreatePropertyResponse {
  success: boolean;
  propertyId?: number;
  data?: any;
  error?: string;
}

class Beds24Service {
  private baseUrl = 'https://beds24.com/api/v2';
  private refreshToken: string | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Load stored tokens from environment or secure storage
    this.refreshToken = process.env.VITE_BEDS24_REFRESH_TOKEN || null;
  }

  /**
   * Step 1: Authentication - Get access token using refresh token
   */
  private async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.refreshToken) {
      throw new Error('No Beds24 refresh token available. Please set up authentication first.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/authentication/token`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'refreshToken': this.refreshToken
        }
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const authData: Beds24AuthResponse = await response.json();
      
      this.accessToken = authData.token;
      this.tokenExpiry = Date.now() + (authData.expiresIn * 1000) - 60000; // Refresh 1 min early
      
      console.log(' Beds24 access token obtained successfully');
      return this.accessToken;

    } catch (error) {
      console.error(' Beds24 authentication failed:', error);
      throw new Error(`Failed to authenticate with Beds24: ${error.message}`);
    }
  }

  /**
   * Step 2: Create Property on Beds24
   */
  async createProperty(propertyData: any): Promise<Beds24CreatePropertyResponse> {
    console.log('🏨 Creating property on Beds24:', propertyData.title);

    try {
      const token = await this.getAccessToken();

      // Map your property data to Beds24 format
      const beds24PropertyData: Beds24Property = {
        name: propertyData.title,
        propertyType: this.mapPropertyType(propertyData.property_type || 'house'),
        currency: 'USD', // or get from your property data
        country: propertyData.country || 'USA',
        state: propertyData.state,
        city: propertyData.city,
        address: propertyData.address,
        postalCode: propertyData.postal_code,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        description: propertyData.description,
        maxOccupancy: propertyData.max_guests,
        roomTypes: [
          {
            name: `${propertyData.title} - Main Unit`,
            qty: 1,
            minPrice: propertyData.price_per_night,
            maxOccupancy: propertyData.max_guests,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms
          }
        ]
      };

      console.log('📊 Beds24 property payload:', beds24PropertyData);

      const response = await fetch(`${this.baseUrl}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'token': token
        },
        body: JSON.stringify([beds24PropertyData]) // Beds24 expects an array
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Beds24 API error response:', errorText);
        throw new Error(`Beds24 API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(' Beds24 create property response:', responseData);

      // Beds24 returns an array of created properties
      if (Array.isArray(responseData) && responseData.length > 0) {
        const createdProperty = responseData[0];
        
        return {
          success: true,
          propertyId: createdProperty.id,
          data: createdProperty
        };
      } else {
        throw new Error('Unexpected response format from Beds24');
      }

    } catch (error) {
      console.error('❌ Failed to create property on Beds24:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 3: Update property pricing and availability
   */
  async updatePropertyPricing(propertyId: number, roomId: number, priceData: {
    from: string;
    to: string;
    price: number;
    minStay?: number;
    availability?: number;
  }): Promise<boolean> {
    console.log('💰 Updating Beds24 property pricing:', { propertyId, roomId });

    try {
      const token = await this.getAccessToken();

      const calendarData = [{
        roomId: roomId,
        calendar: [{
          from: priceData.from,
          to: priceData.to,
          price1: priceData.price,
          minStay: priceData.minStay || 1,
          availability: priceData.availability || 1
        }]
      }];

      const response = await fetch(`${this.baseUrl}/inventory/rooms/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'token': token
        },
        body: JSON.stringify(calendarData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update pricing: ${response.status} - ${errorText}`);
      }

      console.log('Beds24 pricing updated successfully');
      return true;

    } catch (error) {
      console.error(' Failed to update Beds24 pricing:', error);
      return false;
    }
  }

  /**
   * Step 4: Get property details from Beds24
   */
  async getProperty(propertyId: number): Promise<any> {
    console.log('🔍 Getting Beds24 property details:', propertyId);

    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/properties?id=${propertyId}&includeAllRooms=true`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'token': token
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get property: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Beds24 property retrieved:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to get Beds24 property:', error);
      throw error;
    }
  }

  /**
   * Step 5: Get bookings for a property
   */
  async getPropertyBookings(propertyId: number, options: {
    from?: string;
    to?: string;
    status?: string;
  } = {}): Promise<any[]> {
    console.log('📅 Getting Beds24 bookings for property:', propertyId);

    try {
      const token = await this.getAccessToken();

      const params = new URLSearchParams({
        propertyId: propertyId.toString(),
        ...options
      });

      const response = await fetch(`${this.baseUrl}/bookings?${params}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'token': token
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get bookings: ${response.status}`);
      }

      const bookings = await response.json();
      console.log('✅ Beds24 bookings retrieved:', bookings.length);
      return bookings;

    } catch (error) {
      console.error('❌ Failed to get Beds24 bookings:', error);
      return [];
    }
  }

  /**
   * Helper method to map property types to Beds24 format
   */
  private mapPropertyType(type: string): Beds24Property['propertyType'] {
    const mapping: Record<string, Beds24Property['propertyType']> = {
      'house': 'house',
      'apartment': 'apartment',
      'villa': 'villa',
      'hotel': 'hotel',
      'hostel': 'hostel',
      'bnb': 'b&b',
      'bed_and_breakfast': 'b&b'
    };

    return mapping[type.toLowerCase()] || 'house';
  }

  /**
   * Test connection to Beds24
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/properties?limit=1`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'token': token
        }
      });

      const success = response.ok;
      console.log(success ? '✅ Beds24 connection test successful' : '❌ Beds24 connection test failed');
      return success;

    } catch (error) {
      console.error('❌ Beds24 connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const beds24Service = new Beds24Service();

// Export types for use in other files
export type { Beds24Property, Beds24RoomType, Beds24CreatePropertyResponse };