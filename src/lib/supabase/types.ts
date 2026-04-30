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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accountability_entries: {
        Row: {
          amount_cents: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          item_id: string | null
          media_url: string | null
          proof_url: string | null
          reserve_entry_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          item_id?: string | null
          media_url?: string | null
          proof_url?: string | null
          reserve_entry_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          item_id?: string | null
          media_url?: string | null
          proof_url?: string | null
          reserve_entry_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accountability_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "donation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accountability_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_progress"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "accountability_entries_reserve_entry_id_fkey"
            columns: ["reserve_entry_id"]
            isOneToOne: false
            referencedRelation: "global_reserve_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      donation_intents: {
        Row: {
          amount_cents: number
          confirmed_at: string | null
          created_at: string
          display_name_publicly: boolean
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          expires_at: string | null
          id: string
          ip_hash: string | null
          is_anonymous: boolean
          item_id: string
          pix_payload: string | null
          pix_qr_data_url: string | null
          pix_txid: string
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          amount_cents: number
          confirmed_at?: string | null
          created_at?: string
          display_name_publicly?: boolean
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          expires_at?: string | null
          id?: string
          ip_hash?: string | null
          is_anonymous?: boolean
          item_id: string
          pix_payload?: string | null
          pix_qr_data_url?: string | null
          pix_txid: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          amount_cents?: number
          confirmed_at?: string | null
          created_at?: string
          display_name_publicly?: boolean
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          expires_at?: string | null
          id?: string
          ip_hash?: string | null
          is_anonymous?: boolean
          item_id?: string
          pix_payload?: string | null
          pix_qr_data_url?: string | null
          pix_txid?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "donation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_progress"
            referencedColumns: ["item_id"]
          },
        ]
      }
      donation_items: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_type: string
          image_url: string | null
          mission_id: string
          pix_txid_prefix: string
          slug: string
          sort_order: number
          status: string
          target_amount_cents: number
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_type?: string
          image_url?: string | null
          mission_id: string
          pix_txid_prefix?: string
          slug: string
          sort_order?: number
          status?: string
          target_amount_cents?: number
          title: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_type?: string
          image_url?: string | null
          mission_id?: string
          pix_txid_prefix?: string
          slug?: string
          sort_order?: number
          status?: string
          target_amount_cents?: number
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_items_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      global_reserve_entries: {
        Row: {
          amount_cents: number
          created_at: string
          donation_intent_id: string | null
          id: string
          notes: string | null
          reason: string
          source_item_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          donation_intent_id?: string | null
          id?: string
          notes?: string | null
          reason?: string
          source_item_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          donation_intent_id?: string | null
          id?: string
          notes?: string | null
          reason?: string
          source_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_reserve_entries_donation_intent_id_fkey"
            columns: ["donation_intent_id"]
            isOneToOne: false
            referencedRelation: "donation_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_reserve_entries_donation_intent_id_fkey"
            columns: ["donation_intent_id"]
            isOneToOne: false
            referencedRelation: "public_donor_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_reserve_entries_donation_intent_id_fkey"
            columns: ["donation_intent_id"]
            isOneToOne: false
            referencedRelation: "recent_confirmed_donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_reserve_entries_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "donation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_reserve_entries_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "item_progress"
            referencedColumns: ["item_id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          mission_duration_days: number | null
          mission_month: string | null
          region: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          mission_duration_days?: number | null
          mission_month?: string | null
          region?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          mission_duration_days?: number | null
          mission_month?: string | null
          region?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_cents: number | null
          bank_end_to_end_id: string
          donation_intent_id: string | null
          event_type: string
          id: string
          provider: string
          raw_payload: Json | null
          received_at: string
          txid: string | null
        }
        Insert: {
          amount_cents?: number | null
          bank_end_to_end_id: string
          donation_intent_id?: string | null
          event_type: string
          id?: string
          provider?: string
          raw_payload?: Json | null
          received_at?: string
          txid?: string | null
        }
        Update: {
          amount_cents?: number | null
          bank_end_to_end_id?: string
          donation_intent_id?: string | null
          event_type?: string
          id?: string
          provider?: string
          raw_payload?: Json | null
          received_at?: string
          txid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_donation_intent_id_fkey"
            columns: ["donation_intent_id"]
            isOneToOne: false
            referencedRelation: "donation_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_donation_intent_id_fkey"
            columns: ["donation_intent_id"]
            isOneToOne: false
            referencedRelation: "public_donor_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_donation_intent_id_fkey"
            columns: ["donation_intent_id"]
            isOneToOne: false
            referencedRelation: "recent_confirmed_donations"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      confirmed_amount_by_item: {
        Row: {
          confirmed_amount_cents: number | null
          confirmed_count: number | null
          item_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "donation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_progress"
            referencedColumns: ["item_id"]
          },
        ]
      }
      global_reserve_total: {
        Row: {
          reserve_cents: number | null
        }
        Relationships: []
      }
      item_progress: {
        Row: {
          confirmed_amount_cents: number | null
          item_id: string | null
          progress_pct: number | null
          target_amount_cents: number | null
        }
        Relationships: []
      }
      landing_stats: {
        Row: {
          items_completed: number | null
          missions_active: number | null
          projects_active: number | null
          reserve_cents: number | null
          total_raised_cents: number | null
        }
        Relationships: []
      }
      public_donor_list: {
        Row: {
          amount_cents: number | null
          confirmed_at: string | null
          donor_name: string | null
          id: string | null
          item_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          confirmed_at?: string | null
          donor_name?: string | null
          id?: string | null
          item_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          confirmed_at?: string | null
          donor_name?: string | null
          id?: string | null
          item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "donation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_progress"
            referencedColumns: ["item_id"]
          },
        ]
      }
      recent_confirmed_donations: {
        Row: {
          amount_cents: number | null
          confirmed_at: string | null
          display_name_publicly: boolean | null
          donor_name: string | null
          id: string | null
          is_anonymous: boolean | null
          item_id: string | null
          item_slug: string | null
          item_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "donation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_intents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_progress"
            referencedColumns: ["item_id"]
          },
        ]
      }
    }
    Functions: {
      confirm_donation: {
        Args: { p_amount: number; p_event_id: string; p_intent_id: string }
        Returns: undefined
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
