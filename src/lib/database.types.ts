export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_analytics: {
        Row: {
          created_at: string | null
          date_recorded: string
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
        }
        Update: {
          created_at?: string | null
          date_recorded?: string
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_metadata: Json | null
          check_in_date: string
          check_out_date: string
          created_at: string | null
          guest_id: string
          guests_count: number
          id: string
          property_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_metadata?: Json | null
          check_in_date: string
          check_out_date: string
          created_at?: string | null
          guest_id: string
          guests_count?: number
          id?: string
          property_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_metadata?: Json | null
          check_in_date?: string
          check_out_date?: string
          created_at?: string | null
          guest_id?: string
          guests_count?: number
          id?: string
          property_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string | null
          invitation_type: Database["public"]["Enums"]["user_type"]
          invited_by: string
          invitee_name: string | null
          personal_message: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string | null
          invitation_type?: Database["public"]["Enums"]["user_type"]
          invited_by: string
          invitee_name?: string | null
          personal_message?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string | null
          invitation_type?: Database["public"]["Enums"]["user_type"]
          invited_by?: string
          invitee_name?: string | null
          personal_message?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_id: string | null
          metadata: Json | null
          token: string
          used_at: string | null
          used_by: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_id?: string | null
          metadata?: Json | null
          token?: string
          used_at?: string | null
          used_by?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_id?: string | null
          metadata?: Json | null
          token?: string
          used_at?: string | null
          used_by?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tokens_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tokens_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          bathrooms: number | null
          bedrooms: number | null
          beds24_error_message: string | null
          beds24_property_id: string | null
          beds24_sync_data: Json | null
          beds24_sync_status: string | null
          beds24_synced_at: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          max_guests: number | null
          owner_id: string
          postal_code: string | null
          price_per_night: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          submitted_for_approval_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          beds24_error_message?: string | null
          beds24_property_id?: string | null
          beds24_sync_data?: Json | null
          beds24_sync_status?: string | null
          beds24_synced_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_guests?: number | null
          owner_id: string
          postal_code?: string | null
          price_per_night?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          submitted_for_approval_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          beds24_error_message?: string | null
          beds24_property_id?: string | null
          beds24_sync_data?: Json | null
          beds24_sync_status?: string | null
          beds24_synced_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_guests?: number | null
          owner_id?: string
          postal_code?: string | null
          price_per_night?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          submitted_for_approval_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_approvals: {
        Row: {
          action: string
          checklist_items: Json | null
          created_at: string | null
          id: string
          new_status: Database["public"]["Enums"]["property_status"]
          notes: string | null
          previous_status: Database["public"]["Enums"]["property_status"] | null
          property_id: string
          reviewer_id: string
        }
        Insert: {
          action: string
          checklist_items?: Json | null
          created_at?: string | null
          id?: string
          new_status: Database["public"]["Enums"]["property_status"]
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["property_status"]
            | null
          property_id: string
          reviewer_id: string
        }
        Update: {
          action?: string
          checklist_items?: Json | null
          created_at?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["property_status"]
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["property_status"]
            | null
          property_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_approvals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_approvals_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_active_at: string | null
          metadata: Json | null
          onboarding_completed: boolean | null
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          last_active_at?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_property: {
        Args: { property_id: string; admin_id: string; approval_notes?: string }
        Returns: boolean
      }
      can_book_property: {
        Args: { property_id: string }
        Returns: boolean
      }
      expire_old_invitations_and_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_beds24_sync_error: {
        Args: { property_id: string; error_message: string }
        Returns: boolean
      }
      reject_property: {
        Args: {
          property_id: string
          admin_id: string
          rejection_reason: string
        }
        Returns: boolean
      }
      submit_property_for_approval: {
        Args: { property_id: string; submitter_id: string }
        Returns: boolean
      }
      sync_property_with_beds24: {
        Args: { property_id: string; beds24_id: string; beds24_data?: Json }
        Returns: boolean
      }
      validate_onboarding_token: {
        Args: { token_param: string } | { token_param: string }
        Returns: {
          is_valid: boolean
          email: string
          user_type: Database["public"]["Enums"]["user_type"]
          invitation_id: string
        }[]
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      property_status:
        | "draft"
        | "pending_approval"
        | "approved_pending_beds24"
        | "active"
        | "inactive"
        | "suspended"
        | "rejected"
      user_status: "pending" | "active" | "inactive" | "suspended"
      user_type: "admin" | "owner" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      property_status: [
        "draft",
        "pending_approval",
        "approved_pending_beds24",
        "active",
        "inactive",
        "suspended",
        "rejected",
      ],
      user_status: ["pending", "active", "inactive", "suspended"],
      user_type: ["admin", "owner", "user"],
    },
  },
} as const
