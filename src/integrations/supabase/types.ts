export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      generated_content: {
        Row: {
          content_type: string
          created_at: string
          credits_used: number | null
          id: string
          input_data: Json
          output_data: Json
          product_id: string | null
          product_image: string | null
          product_title: string | null
          tone: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          credits_used?: number | null
          id?: string
          input_data: Json
          output_data: Json
          product_id?: string | null
          product_image?: string | null
          product_title?: string | null
          tone?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          credits_used?: number | null
          id?: string
          input_data?: Json
          output_data?: Json
          product_id?: string | null
          product_image?: string | null
          product_title?: string | null
          tone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      history: {
        Row: {
          created_at: string
          id: string
          input_data: Json
          output_data: Json
          tool_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_data: Json
          output_data: Json
          tool_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_data?: Json
          output_data?: Json
          tool_type?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          created_at: string
          customer_name: string | null
          id: string
          notes: string | null
          order_value: number | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_value?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_value?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_used: number | null
          email: string | null
          full_name: string | null
          id: string
          plan: string | null
          preferred_language: string | null
          tracking_config: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_used?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string | null
          preferred_language?: string | null
          tracking_config?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_used?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string | null
          preferred_language?: string | null
          tracking_config?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      shopify_connections: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          scopes: string | null
          shop_name: string | null
          shop_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          scopes?: string | null
          shop_name?: string | null
          shop_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          scopes?: string | null
          shop_name?: string | null
          shop_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      store_connections: {
        Row: {
          api_key: string | null
          api_key_encrypted: string | null
          api_secret: string | null
          api_secret_encrypted: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          platform: Database["public"]["Enums"]["store_platform"]
          products_count: number | null
          store_name: string
          store_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          api_key_encrypted?: string | null
          api_secret?: string | null
          api_secret_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          platform: Database["public"]["Enums"]["store_platform"]
          products_count?: number | null
          store_name: string
          store_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          api_key_encrypted?: string | null
          api_secret?: string | null
          api_secret_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          platform?: Database["public"]["Enums"]["store_platform"]
          products_count?: number | null
          store_name?: string
          store_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      synced_products: {
        Row: {
          compare_at_price: number | null
          created_at: string
          description: string | null
          external_product_id: string
          generated_at: string | null
          generated_description: string | null
          generated_title: string | null
          id: string
          image_url: string | null
          inventory_quantity: number | null
          last_synced_at: string | null
          price: number | null
          product_url: string | null
          status: string | null
          store_connection_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          external_product_id: string
          generated_at?: string | null
          generated_description?: string | null
          generated_title?: string | null
          id?: string
          image_url?: string | null
          inventory_quantity?: number | null
          last_synced_at?: string | null
          price?: number | null
          product_url?: string | null
          status?: string | null
          store_connection_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          external_product_id?: string
          generated_at?: string | null
          generated_description?: string | null
          generated_title?: string | null
          id?: string
          image_url?: string | null
          inventory_quantity?: number | null
          last_synced_at?: string | null
          price?: number | null
          product_url?: string | null
          status?: string | null
          store_connection_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "synced_products_store_connection_id_fkey"
            columns: ["store_connection_id"]
            isOneToOne: false
            referencedRelation: "store_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_products_store_connection_id_fkey"
            columns: ["store_connection_id"]
            isOneToOne: false
            referencedRelation: "store_connections_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      usage: {
        Row: {
          created_at: string
          generations_count: number
          id: string
          month_year: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generations_count?: number
          id?: string
          month_year: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generations_count?: number
          id?: string
          month_year?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          action: string
          created_at: string
          credits: number | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          credits?: number | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          credits?: number | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      store_connections_safe: {
        Row: {
          created_at: string | null
          has_api_key: boolean | null
          has_api_secret: boolean | null
          id: string | null
          is_active: boolean | null
          last_sync_at: string | null
          platform: Database["public"]["Enums"]["store_platform"] | null
          products_count: number | null
          store_name: string | null
          store_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          has_api_key?: never
          has_api_secret?: never
          id?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          platform?: Database["public"]["Enums"]["store_platform"] | null
          products_count?: number | null
          store_name?: string | null
          store_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          has_api_key?: never
          has_api_secret?: never
          id?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          platform?: Database["public"]["Enums"]["store_platform"] | null
          products_count?: number | null
          store_name?: string | null
          store_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrypt_api_credential: {
        Args: { encrypted_credential: string }
        Returns: string
      }
      encrypt_api_credential: { Args: { credential: string }; Returns: string }
      get_shopify_token: { Args: { connection_uuid: string }; Returns: string }
      get_store_credentials: {
        Args: { connection_uuid: string }
        Returns: {
          api_key: string
          api_secret: string
        }[]
      }
    }
    Enums: {
      store_platform: "shopify" | "woocommerce"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      store_platform: ["shopify", "woocommerce"],
    },
  },
} as const
