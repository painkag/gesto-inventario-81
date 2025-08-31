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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          company_id: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          ai_enabled: boolean | null
          city: string | null
          consent_ip: string | null
          consent_opt_in: boolean | null
          consent_timestamp: string | null
          consent_version: string | null
          created_at: string
          document: string | null
          fiscal_email: string | null
          id: string
          is_blocked: boolean | null
          name: string
          phone: string | null
          plan: string
          state: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          ai_enabled?: boolean | null
          city?: string | null
          consent_ip?: string | null
          consent_opt_in?: boolean | null
          consent_timestamp?: string | null
          consent_version?: string | null
          created_at?: string
          document?: string | null
          fiscal_email?: string | null
          id?: string
          is_blocked?: boolean | null
          name: string
          phone?: string | null
          plan?: string
          state?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          ai_enabled?: boolean | null
          city?: string | null
          consent_ip?: string | null
          consent_opt_in?: boolean | null
          consent_timestamp?: string | null
          consent_version?: string | null
          created_at?: string
          document?: string | null
          fiscal_email?: string | null
          id?: string
          is_blocked?: boolean | null
          name?: string
          phone?: string | null
          plan?: string
          state?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_counters: {
        Row: {
          company_id: string
          purchase_seq: number
          sale_seq: number
          updated_at: string
        }
        Insert: {
          company_id: string
          purchase_seq?: number
          sale_seq?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          purchase_seq?: number
          sale_seq?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_batches: {
        Row: {
          batch_number: string | null
          company_id: string
          cost_price: number | null
          created_at: string
          expiry_date: string | null
          id: string
          product_id: string
          quantity: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          company_id: string
          cost_price?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          product_id: string
          quantity?: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          company_id?: string
          cost_price?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          product_id?: string
          quantity?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_batches_product_company"
            columns: ["product_id", "company_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "inventory_batches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          code: string
          company_id: string
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          min_stock: number | null
          name: string
          selling_price: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          code: string
          company_id: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          selling_price?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          code?: string
          company_id?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          selling_price?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          company_id: string
          created_at: string
          expiry_date: string | null
          id: string
          product_id: string
          purchase_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          company_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          product_id: string
          purchase_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          company_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          product_id?: string
          purchase_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_items_product_company"
            columns: ["product_id", "company_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "fk_purchase_items_purchase_company"
            columns: ["purchase_id", "company_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "purchase_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          purchase_number: string
          status: string
          supplier_document: string | null
          supplier_name: string
          total_amount: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          purchase_number: string
          status?: string
          supplier_document?: string | null
          supplier_name: string
          total_amount?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          purchase_number?: string
          status?: string
          supplier_document?: string | null
          supplier_name?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          batch_id: string | null
          company_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          batch_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_sale_items_batch_company"
            columns: ["batch_id", "company_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "fk_sale_items_product_company"
            columns: ["product_id", "company_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "fk_sale_items_sale_company"
            columns: ["sale_id", "company_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "sale_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          customer_document: string | null
          customer_name: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          notes: string | null
          payment_method: string | null
          sale_number: string
          status: string
          subtotal: number
          total_amount: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_document?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_number: string
          status?: string
          subtotal?: number
          total_amount?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_document?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_number?: string
          status?: string
          subtotal?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          total_price: number | null
          type: string
          unit_price: number | null
        }
        Insert: {
          batch_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_price?: number | null
          type: string
          unit_price?: number | null
        }
        Update: {
          batch_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_price?: number | null
          type?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_movements_batch_company"
            columns: ["batch_id", "company_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "fk_movements_product_company"
            columns: ["product_id", "company_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "stock_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          ai_included: boolean | null
          company_id: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan: string
          status: string
          updated_at: string
        }
        Insert: {
          ai_included?: boolean | null
          company_id: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          plan: string
          status?: string
          updated_at?: string
        }
        Update: {
          ai_included?: boolean | null
          company_id?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_product_stock: {
        Args: { product_uuid: string }
        Returns: number
      }
      next_purchase_number: {
        Args: { comp_id: string }
        Returns: string
      }
      next_sale_number: {
        Args: { comp_id: string }
        Returns: string
      }
    }
    Enums: {
      user_role: "OWNER" | "STAFF"
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
      user_role: ["OWNER", "STAFF"],
    },
  },
} as const
