// src/services/beds24Service.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateProperty } from '@/hooks/useQueries'
import type { Database } from '@/lib/database.types'

interface Beds24Config {
  apiKey: string
  apiUrl: string
}

interface Beds24Property {
  [key: string]: any // Make it compatible with Json type
  propId: string
  propName: string
  propStatus: string
  propType: string
}

interface Beds24Voucher {
  voucherId: string
  voucherCode: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  validFrom: string
  validTo: string
  propId: string
  maxUses?: number
  usedCount?: number
}

interface TrustLevelVoucher {
  trustLevel: number
  voucherCode: string
  discountPercentage: number
  propId: string
}

class Beds24Service {
  private config: Beds24Config

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_BEDS24_API_KEY || '',
      apiUrl: import.meta.env.VITE_BEDS24_API_URL || 'https://api.beds24.com/json'
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    const url = `${this.config.apiUrl}/${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add API key to headers or query params based on Beds24 requirements
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      })

      if (!response.ok) {
        throw new Error(`Beds24 API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Beds24 API request failed:', error)
      throw error
    }
  }

  // Create property on Beds24
  async createProperty(propertyData: {
    name: string
    description: string
    address: string
    city: string
    country: string
    maxGuests: number
    bedrooms: number
    bathrooms: number
    pricePerNight: number
  }): Promise<{ success: boolean; propId?: string; error?: string }> {
    try {
      // Check if we're in demo mode
      if (!this.config.apiKey) {
        console.log('Demo mode: Would create property on Beds24:', propertyData.name)
        const mockPropId = `beds24-${Date.now()}`
        return { success: true, propId: mockPropId }
      }

      const beds24Data = {
        propName: propertyData.name,
        propDescription: propertyData.description,
        propAddress: propertyData.address,
        propCity: propertyData.city,
        propCountry: propertyData.country,
        propMaxGuests: propertyData.maxGuests,
        propBedrooms: propertyData.bedrooms,
        propBathrooms: propertyData.bathrooms,
        propBasePrice: propertyData.pricePerNight
      }

      const result = await this.makeRequest('properties', 'POST', beds24Data)
      
      return {
        success: true,
        propId: result.propId || result.id
      }
    } catch (error) {
      console.error('Failed to create property on Beds24:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Create vouchers for trust levels
  async createVouchersForProperty(
    propId: string,
    trustLevels: Array<{
      level: number
      name: string
      discountPercentage: number
    }>
  ): Promise<{ success: boolean; vouchers?: TrustLevelVoucher[]; error?: string }> {
    try {
      // Check if we're in demo mode
      if (!this.config.apiKey) {
        console.log('Demo mode: Would create vouchers for property:', propId)
        const mockVouchers = trustLevels.map(level => ({
          trustLevel: level.level,
          voucherCode: `${level.name.toUpperCase().replace(/\s/g, '')}${level.discountPercentage}`,
          discountPercentage: level.discountPercentage,
          propId
        }))
        return { success: true, vouchers: mockVouchers }
      }

      const vouchers: TrustLevelVoucher[] = []
      
      for (const level of trustLevels) {
        const voucherCode = `${level.name.toUpperCase().replace(/\s/g, '')}${level.discountPercentage}`
        
        const voucherData = {
          voucherCode,
          discountType: 'percentage',
          discountValue: level.discountPercentage,
          propId,
          validFrom: new Date().toISOString().split('T')[0],
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year validity
          maxUses: 1000 // or set based on your business logic
        }

        try {
          const result = await this.makeRequest('vouchers', 'POST', voucherData)
          
          vouchers.push({
            trustLevel: level.level,
            voucherCode,
            discountPercentage: level.discountPercentage,
            propId
          })
        } catch (voucherError) {
          console.error(`Failed to create voucher for trust level ${level.level}:`, voucherError)
          // Continue with other vouchers even if one fails
        }
      }

      return { success: true, vouchers }
    } catch (error) {
      console.error('Failed to create vouchers:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Update property status on Beds24
  async updatePropertyStatus(propId: string, status: 'active' | 'inactive'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.config.apiKey) {
        console.log(`Demo mode: Would update property ${propId} status to ${status}`)
        return { success: true }
      }

      await this.makeRequest(`properties/${propId}`, 'PUT', {
        propStatus: status
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to update property status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get property details from Beds24
  async getProperty(propId: string): Promise<{ success: boolean; property?: Beds24Property; error?: string }> {
    try {
      if (!this.config.apiKey) {
        console.log(`Demo mode: Would fetch property ${propId}`)
        return {
          success: true,
          property: {
            propId,
            propName: 'Demo Property',
            propStatus: 'active',
            propType: 'apartment'
          }
        }
      }

      const property = await this.makeRequest(`properties/${propId}`)
      
      return { success: true, property }
    } catch (error) {
      console.error('Failed to get property from Beds24:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Sync property data with local database
  async syncPropertyWithDatabase(localPropertyId: string, beds24PropId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get property data from Beds24
      const beds24Result = await this.getProperty(beds24PropId)
      
      if (!beds24Result.success || !beds24Result.property) {
        throw new Error('Failed to fetch property from Beds24')
      }

      // Update local database with Beds24 data
      const { error } = await supabase
        .from('properties')
        .update({
          beds24_property_id: beds24PropId,
          beds24_sync_status: 'synced',
          beds24_sync_data: beds24Result.property,
          beds24_synced_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', localPropertyId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to sync property:', error)
      
      // Update database with error status
      await supabase
        .from('properties')
        .update({
          beds24_sync_status: 'error',
          beds24_error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', localPropertyId)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Complete property approval process
  async approvePropertyWithBeds24Integration(
    localPropertyId: string,
    adminId: string,
    notes?: string
  ): Promise<{ success: boolean; beds24PropId?: string; vouchers?: TrustLevelVoucher[]; error?: string }> {
    try {
      // 1. Get property data from local database
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          owner:users!owner_id(id, full_name, email)
        `)
        .eq('id', localPropertyId)
        .single()

      if (propertyError || !property) {
        throw new Error('Property not found')
      }

      // 2. Create property on Beds24
      const beds24Result = await this.createProperty({
        name: property.title,
        description: property.description || '',
        address: property.address || '',
        city: property.city || '',
        country: property.country || '',
        maxGuests: property.max_guests || 1,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        pricePerNight: property.price_per_night || 0
      })

      if (!beds24Result.success || !beds24Result.propId) {
        throw new Error(beds24Result.error || 'Failed to create property on Beds24')
      }

      // 3. Get owner's trust levels
      const { data: trustLevels, error: trustLevelsError } = await supabase
        .from('trust_level_definitions')
        .select('*')
        .eq('owner_id', property.owner_id)
        .order('level', { ascending: true })

      if (trustLevelsError) {
        console.warn('Failed to get trust levels:', trustLevelsError)
      }

      let vouchers: TrustLevelVoucher[] = []

      // 4. Create vouchers if trust levels exist
      if (trustLevels && trustLevels.length > 0) {
        const voucherResult = await this.createVouchersForProperty(
          beds24Result.propId,
          trustLevels.map(level => ({
            level: level.level,
            name: level.name,
            discountPercentage: level.default_discount_percentage || 0
          }))
        )

        if (voucherResult.success && voucherResult.vouchers) {
          vouchers = voucherResult.vouchers
        }
      }

      // 5. Sync with local database
      const syncResult = await this.syncPropertyWithDatabase(localPropertyId, beds24Result.propId)
      
      if (!syncResult.success) {
        console.warn('Property created on Beds24 but sync failed:', syncResult.error)
      }

      // 6. Create approval record
      await supabase
        .from('property_approvals')
        .insert({
          property_id: localPropertyId,
          reviewer_id: adminId,
          action: 'approve',
          previous_status: property.status,
          new_status: 'active',
          notes: notes || null,
          checklist_items: {
            beds24_created: beds24Result.success,
            vouchers_created: vouchers.length > 0,
            sync_completed: syncResult.success
          }
        })

      return {
        success: true,
        beds24PropId: beds24Result.propId,
        vouchers
      }
    } catch (error) {
      console.error('Failed to approve property with Beds24 integration:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const beds24Service = new Beds24Service()

// Enhanced property approval hook using existing services
export const useApprovePropertyWithBeds24 = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { updateProperty } = useUpdateProperty()
  const { user } = useAuth()
  
  const approveProperty = async (
    propertyId: string,
    notes?: string
  ) => {
    if (!user) throw new Error('User not authenticated')
    
    setIsLoading(true)
    
    try {
      const result = await beds24Service.approvePropertyWithBeds24Integration(
        propertyId,
        user.id,
        notes
      )
      
      if (result.success) {
        console.log('Property approved successfully:', {
          beds24PropId: result.beds24PropId,
          vouchersCreated: result.vouchers?.length || 0
        })
        
        return {
          success: true,
          beds24PropId: result.beds24PropId,
          vouchers: result.vouchers
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Property approval failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    approveProperty,
    isLoading
  }
}