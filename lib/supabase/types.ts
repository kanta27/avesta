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
      blog_posts: {
        Row: {
          body_md: string | null
          cover_image: Json | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          schema_type: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          source: string | null
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          body_md?: string | null
          cover_image?: Json | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          schema_type?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          body_md?: string | null
          cover_image?: Json | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          schema_type?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      bundles: {
        Row: {
          compare_at_paise: number | null
          concern: string | null
          created_at: string | null
          id: string
          image: Json | null
          is_active: boolean | null
          name: string
          price_paise: number
          product_ids: string[]
          slug: string
        }
        Insert: {
          compare_at_paise?: number | null
          concern?: string | null
          created_at?: string | null
          id?: string
          image?: Json | null
          is_active?: boolean | null
          name: string
          price_paise: number
          product_ids: string[]
          slug: string
        }
        Update: {
          compare_at_paise?: number | null
          concern?: string | null
          created_at?: string | null
          id?: string
          image?: Json | null
          is_active?: boolean | null
          name?: string
          price_paise?: number
          product_ids?: string[]
          slug?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          items: Json | null
          last_seen_at: string | null
          phone: string | null
          recovery_sent: boolean | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          items?: Json | null
          last_seen_at?: string | null
          phone?: string | null
          recovery_sent?: boolean | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          items?: Json | null
          last_seen_at?: string | null
          phone?: string | null
          recovery_sent?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      concern_pages: {
        Row: {
          concern: string
          created_at: string | null
          faqs: Json | null
          h1: string | null
          id: string
          intro_md: string | null
          product_ids: string[] | null
          seo_description: string | null
          seo_title: string | null
          slug: string
        }
        Insert: {
          concern: string
          created_at?: string | null
          faqs?: Json | null
          h1?: string | null
          id?: string
          intro_md?: string | null
          product_ids?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
        }
        Update: {
          concern?: string
          created_at?: string | null
          faqs?: Json | null
          h1?: string | null
          id?: string
          intro_md?: string | null
          product_ids?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          kind: string
          min_order_paise: number | null
          per_phone_limit: number | null
          starts_at: string | null
          usage_limit: number | null
          used_count: number | null
          value_paise: number | null
          value_pct: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          kind: string
          min_order_paise?: number | null
          per_phone_limit?: number | null
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          value_paise?: number | null
          value_pct?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          kind?: string
          min_order_paise?: number | null
          per_phone_limit?: number | null
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          value_paise?: number | null
          value_pct?: number | null
        }
        Relationships: []
      }
      discount_redemptions: {
        Row: {
          code_id: string | null
          created_at: string | null
          id: string
          order_id: string | null
          phone: string | null
        }
        Insert: {
          code_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          phone?: string | null
        }
        Update: {
          code_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          alt: string | null
          category: string | null
          created_at: string | null
          id: string
          sort: number | null
          url: string
        }
        Insert: {
          alt?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          sort?: number | null
          url: string
        }
        Update: {
          alt?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          sort?: number | null
          url?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          consent_at: string | null
          consent_whatsapp: boolean | null
          converted: boolean | null
          converted_order_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          quiz_answers: Json | null
          recommended_product_id: string | null
          source_page: string | null
          source_type: string
        }
        Insert: {
          consent_at?: string | null
          consent_whatsapp?: boolean | null
          converted?: boolean | null
          converted_order_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          quiz_answers?: Json | null
          recommended_product_id?: string | null
          source_page?: string | null
          source_type: string
        }
        Update: {
          consent_at?: string | null
          consent_whatsapp?: boolean | null
          converted?: boolean | null
          converted_order_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          quiz_answers?: Json | null
          recommended_product_id?: string | null
          source_page?: string | null
          source_type?: string
        }
        Relationships: []
      }
      order_number_counters: {
        Row: {
          last_seq: number
          year: number
        }
        Insert: {
          last_seq?: number
          year: number
        }
        Update: {
          last_seq?: number
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          courier: string | null
          created_at: string | null
          customer_phone: string
          discount_code: string | null
          discount_paise: number | null
          email: string | null
          id: string
          items: Json
          name: string | null
          order_number: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          shipping_address: Json
          shipping_paise: number | null
          status: string
          subtotal_paise: number
          total_paise: number
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          courier?: string | null
          created_at?: string | null
          customer_phone: string
          discount_code?: string | null
          discount_paise?: number | null
          email?: string | null
          id?: string
          items: Json
          name?: string | null
          order_number: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping_address: Json
          shipping_paise?: number | null
          status?: string
          subtotal_paise: number
          total_paise: number
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          courier?: string | null
          created_at?: string | null
          customer_phone?: string
          discount_code?: string | null
          discount_paise?: number | null
          email?: string | null
          id?: string
          items?: Json
          name?: string | null
          order_number?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping_address?: Json
          shipping_paise?: number | null
          status?: string
          subtotal_paise?: number
          total_paise?: number
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pageviews: {
        Row: {
          created_at: string | null
          id: number
          path: string | null
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          path?: string | null
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          path?: string | null
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          badges: Json | null
          bioactives: Json | null
          concerns: string[]
          created_at: string | null
          description: string | null
          faqs: Json | null
          id: string
          images: Json | null
          ingredients: Json | null
          is_active: boolean | null
          name: string
          pack_tiers: Json
          rating_avg: number | null
          rating_source: string | null
          science_html: string | null
          slug: string
          stock_count: number | null
          tagline: string | null
          type: string
          who_for: string | null
          who_not_for: string | null
        }
        Insert: {
          badges?: Json | null
          bioactives?: Json | null
          concerns?: string[]
          created_at?: string | null
          description?: string | null
          faqs?: Json | null
          id?: string
          images?: Json | null
          ingredients?: Json | null
          is_active?: boolean | null
          name: string
          pack_tiers?: Json
          rating_avg?: number | null
          rating_source?: string | null
          science_html?: string | null
          slug: string
          stock_count?: number | null
          tagline?: string | null
          type: string
          who_for?: string | null
          who_not_for?: string | null
        }
        Update: {
          badges?: Json | null
          bioactives?: Json | null
          concerns?: string[]
          created_at?: string | null
          description?: string | null
          faqs?: Json | null
          id?: string
          images?: Json | null
          ingredients?: Json | null
          is_active?: boolean | null
          name?: string
          pack_tiers?: Json
          rating_avg?: number | null
          rating_source?: string | null
          science_html?: string | null
          slug?: string
          stock_count?: number | null
          tagline?: string | null
          type?: string
          who_for?: string | null
          who_not_for?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          body: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          location: string | null
          product_id: string | null
          rating: number | null
          reel_url: string | null
          source: string | null
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          product_id?: string | null
          rating?: number | null
          reel_url?: string | null
          source?: string | null
        }
        Update: {
          author_name?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          product_id?: string | null
          rating?: number | null
          reel_url?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      next_order_number: { Args: never; Returns: string }
      redeem_discount: {
        Args: { p_code: string; p_order_id: string; p_phone: string }
        Returns: boolean
      }
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
