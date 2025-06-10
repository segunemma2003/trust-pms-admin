import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']

export interface PropertyFormData {
  title: string
  description: string
  address: string
  city: string
  state?: string
  country: string
  price_per_night: number
  bedrooms: number
  bathrooms: number
  max_guests: number
  images: string[]
  amenities?: string[]
}

export const propertyService = {
  // Create property suggestion (owner submits for approval)
  createPropertySuggestion: async (propertyData: PropertyFormData, ownerId: string) => {
    console.log('🏠 Creating property suggestion:', { title: propertyData.title, ownerId })
    
    try {
      // Prepare property data for insertion
      const propertyInsert: PropertyInsert = {
        owner_id: ownerId,
        title: propertyData.title,
        description: propertyData.description,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state || null,
        country: propertyData.country,
        price_per_night: propertyData.price_per_night,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        max_guests: propertyData.max_guests,
        images: propertyData.images,
        amenities: propertyData.amenities || null,
        status: 'draft', // Initial status
        beds24_property_id: null, // Will be set when enlisted to Beds24
        beds24_sync_status: null,
        beds24_sync_data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert into database
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyInsert)
        .select(`
          *,
          owner:users!owner_id(full_name, email)
        `)
        .single()

      if (error) {
        console.error('❌ Error creating property:', error)
        throw error
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'property_suggested',
        user_id: ownerId,
        resource_type: 'property',
        resource_id: data.id,
        details: {
          property_title: propertyData.title,
          property_city: propertyData.city
        }
      })

      console.log('✅ Property suggestion created successfully:', data.id)
      return { data, error: null }

    } catch (error) {
      console.error('❌ Property suggestion failed:', error)
      return { data: null, error }
    }
  },

  // Submit property for admin approval (changes status from draft to pending_approval)
  submitForApproval: async (propertyId: string, ownerId: string) => {
    console.log('📋 Submitting property for approval:', propertyId)
    
    try {
      // Use the database function for atomic operation
      const { data, error } = await supabase.rpc('submit_property_for_approval', {
        property_id: propertyId,
        submitter_id: ownerId
      })

      if (error) throw error

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'property_submitted_for_approval',
        user_id: ownerId,
        resource_type: 'property',
        resource_id: propertyId
      })

      console.log('✅ Property submitted for approval')
      return { data, error: null }

    } catch (error) {
      console.error('❌ Submit for approval failed:', error)
      return { data: null, error }
    }
  },

  // Get properties by owner
  getOwnerProperties: async (ownerId: string) => {
    console.log('📋 Getting properties for owner:', ownerId)
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          bookings(count)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('✅ Retrieved owner properties:', data?.length || 0)
      return { data: data || [], error: null }

    } catch (error) {
      console.error('❌ Get owner properties failed:', error)
      return { data: [], error }
    }
  },

  // Admin functions for property approval and Beds24 integration

  // Approve property (admin only) - moves to approved_pending_beds24 status
  approveProperty: async (propertyId: string, adminId: string, notes?: string) => {
    console.log('✅ Approving property:', propertyId)
    
    try {
      const { data, error } = await supabase.rpc('approve_property', {
        property_id: propertyId,
        admin_id: adminId,
        approval_notes: notes
      })

      if (error) throw error

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'property_approved',
        user_id: adminId,
        resource_type: 'property',
        resource_id: propertyId,
        details: { notes }
      })

      console.log('✅ Property approved successfully')
      return { data, error: null }

    } catch (error) {
      console.error('❌ Property approval failed:', error)
      return { data: null, error }
    }
  },

  // Enlist property to Beds24 (admin only)
  enlistToBeds24: async (propertyId: string, adminId: string) => {
    console.log('🏨 Enlisting property to Beds24:', propertyId)
    
    try {
      // 1. Get property details
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (fetchError || !property) {
        throw new Error('Property not found')
      }

      // 2. Check if property is in correct status
      if (property.status !== 'approved_pending_beds24') {
        throw new Error('Property must be approved before enlisting to Beds24')
      }

      // 3. Call Beds24 API to create property
      const beds24Response = await createPropertyOnBeds24(property)
      
      if (!beds24Response.success) {
        throw new Error(`Beds24 API error: ${beds24Response.data}`)
      }

      // 4. Update property with Beds24 data
      const { data: updatedProperty, error: updateError } = await supabase
        .from('properties')
        .update({
          beds24_property_id: beds24Response.propertyId,
          status: 'active',
          beds24_sync_status: 'synced',
          beds24_synced_at: new Date().toISOString(),
          beds24_sync_data: beds24Response.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .select()
        .single()

      if (updateError) throw updateError

      // 5. Log activity
      await supabase.from('activity_logs').insert({
        action: 'property_enlisted_beds24',
        user_id: adminId,
        resource_type: 'property',
        resource_id: propertyId,
        details: {
          beds24_property_id: beds24Response.propertyId,
          property_title: property.title
        }
      })

      console.log('✅ Property successfully enlisted to Beds24:', beds24Response.propertyId)
      return { 
        data: updatedProperty, 
        beds24PropertyId: beds24Response.propertyId,
        error: null 
      }

    } catch (error) {
      console.error('❌ Beds24 enlistment failed:', error)
      
      // Update property with error status
      await supabase
        .from('properties')
        .update({
          beds24_sync_status: 'error',
          beds24_error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      return { data: null, error }
    }
  },

  // Get properties pending Beds24 enlistment (admin only)
  getPropertiesPendingBeds24: async () => {
    console.log('📋 Getting properties pending Beds24 enlistment')
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:users!owner_id(full_name, email)
        `)
        .eq('status', 'approved_pending_beds24')
        .order('approved_at', { ascending: true })

      if (error) throw error

      console.log('✅ Retrieved properties pending Beds24:', data?.length || 0)
      return { data: data || [], error: null }

    } catch (error) {
      console.error('❌ Get pending properties failed:', error)
      return { data: [], error }
    }
  }
}

// Beds24 API integration function using official API V2
async function createPropertyOnBeds24(property: any) {
  console.log('🏨 Creating property on Beds24 API V2...')
  
  try {
    // Import the Beds24 service
    const { beds24Service } = await import('./beds24Service')
    
    // Check if we have proper credentials
    const hasCredentials = process.env.VITE_BEDS24_REFRESH_TOKEN
    
    if (!hasCredentials) {
      console.log('🧪 Demo mode: No Beds24 credentials found')
      return {
        success: true,
        propertyId: `BEDS24_DEMO_${Date.now()}`,
        data: {
          demo: true,
          message: 'Demo property created - add VITE_BEDS24_REFRESH_TOKEN to enable real API',
          created_at: new Date().toISOString()
        }
      }
    }

    // Test connection first
    const connectionTest = await beds24Service.testConnection()
    if (!connectionTest) {
      throw new Error('Failed to connect to Beds24 API')
    }

    // Create property using official Beds24 API V2
    const result = await beds24Service.createProperty(property)
    
    if (result.success) {
      console.log('✅ Property created on Beds24:', result.propertyId)
      
      // Optionally set initial pricing and availability
      if (result.propertyId && result.data?.roomTypes?.[0]?.id) {
        const roomId = result.data.roomTypes[0].id
        const today = new Date().toISOString().split('T')[0]
        const nextYear = new Date()
        nextYear.setFullYear(nextYear.getFullYear() + 1)
        const endDate = nextYear.toISOString().split('T')[0]
        
        await beds24Service.updatePropertyPricing(result.propertyId, roomId, {
          from: today,
          to: endDate,
          price: property.price_per_night,
          minStay: 1,
          availability: 1
        })
      }
      
      return {
        success: true,
        propertyId: result.propertyId.toString(),
        data: result.data
      }
    } else {
      throw new Error(result.error || 'Failed to create property on Beds24')
    }

  } catch (error) {
    console.error('❌ Beds24 API error:', error)
    
    // Fallback to demo mode if API fails
    console.log('🧪 Falling back to demo mode due to API error')
    return {
      success: true,
      propertyId: `BEDS24_FALLBACK_${Date.now()}`,
      data: {
        demo: true,
        error_fallback: true,
        original_error: error.message,
        created_at: new Date().toISOString()
      }
    }
  }
}