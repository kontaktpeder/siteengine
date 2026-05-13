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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      client_brains: {
        Row: {
          audience: Json
          brand_keywords: Json
          client_id: string
          created_at: string
          cta_primary_href: string | null
          cta_primary_label: string | null
          cta_secondary_href: string | null
          cta_secondary_label: string | null
          faq: Json
          id: string
          internal_notes: string | null
          long_description: string | null
          mission: string | null
          partners: Json
          primary_goal: string | null
          problem_statement: string | null
          raw_notes: string | null
          secondary_goal: string | null
          services: Json
          short_description: string | null
          site_type: string
          solution_statement: string | null
          tone_keywords: Json
          trust_points: Json
          updated_at: string
          vision: string | null
        }
        Insert: {
          audience?: Json
          brand_keywords?: Json
          client_id: string
          created_at?: string
          cta_primary_href?: string | null
          cta_primary_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          faq?: Json
          id?: string
          internal_notes?: string | null
          long_description?: string | null
          mission?: string | null
          partners?: Json
          primary_goal?: string | null
          problem_statement?: string | null
          raw_notes?: string | null
          secondary_goal?: string | null
          services?: Json
          short_description?: string | null
          site_type?: string
          solution_statement?: string | null
          tone_keywords?: Json
          trust_points?: Json
          updated_at?: string
          vision?: string | null
        }
        Update: {
          audience?: Json
          brand_keywords?: Json
          client_id?: string
          created_at?: string
          cta_primary_href?: string | null
          cta_primary_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          faq?: Json
          id?: string
          internal_notes?: string | null
          long_description?: string | null
          mission?: string | null
          partners?: Json
          primary_goal?: string | null
          problem_statement?: string | null
          raw_notes?: string | null
          secondary_goal?: string | null
          services?: Json
          short_description?: string | null
          site_type?: string
          solution_statement?: string | null
          tone_keywords?: Json
          trust_points?: Json
          updated_at?: string
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brains_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_domains: {
        Row: {
          client_id: string
          created_at: string
          domain: string
          id: string
          is_primary: boolean
          verified: boolean
        }
        Insert: {
          client_id: string
          created_at?: string
          domain: string
          id?: string
          is_primary?: boolean
          verified?: boolean
        }
        Update: {
          client_id?: string
          created_at?: string
          domain?: string
          id?: string
          is_primary?: boolean
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "client_domains_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organization_number: string | null
          phone: string | null
          primary_domain: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_number?: string | null
          phone?: string | null
          primary_domain?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_number?: string | null
          phone?: string | null
          primary_domain?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          message: string | null
          metadata: Json
          name: string | null
          phone: string | null
          source_page: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          name?: string | null
          phone?: string | null
          source_page?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          name?: string | null
          phone?: string | null
          source_page?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          client_id: string
          created_at: string
          id: string
          tags: Json
          title: string | null
          type: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          client_id: string
          created_at?: string
          id?: string
          tags?: Json
          title?: string | null
          type?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          client_id?: string
          created_at?: string
          id?: string
          tags?: Json
          title?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          body: string | null
          content: Json
          created_at: string
          id: string
          image_url: string | null
          is_visible: boolean
          module_type: string
          page_id: string
          settings: Json
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
          variant: string
        }
        Insert: {
          body?: string | null
          content?: Json
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean
          module_type: string
          page_id: string
          settings?: Json
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          variant?: string
        }
        Update: {
          body?: string | null
          content?: Json
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean
          module_type?: string
          page_id?: string
          settings?: Json
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          client_id: string
          created_at: string
          id: string
          meta_description: string | null
          meta_title: string | null
          noindex: boolean
          og_image_url: string | null
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_image_url?: string | null
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_image_url?: string | null
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_pages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      site_recipes: {
        Row: {
          client_id: string
          color_palette: Json
          created_at: string
          design_direction: string | null
          enabled_modules: Json
          footer: Json
          id: string
          layout_preferences: Json
          navigation: Json
          recipe_type: string
          typography: Json
          updated_at: string
        }
        Insert: {
          client_id: string
          color_palette?: Json
          created_at?: string
          design_direction?: string | null
          enabled_modules?: Json
          footer?: Json
          id?: string
          layout_preferences?: Json
          navigation?: Json
          recipe_type?: string
          typography?: Json
          updated_at?: string
        }
        Update: {
          client_id?: string
          color_palette?: Json
          created_at?: string
          design_direction?: string | null
          enabled_modules?: Json
          footer?: Json
          id?: string
          layout_preferences?: Json
          navigation?: Json
          recipe_type?: string
          typography?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_recipes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
