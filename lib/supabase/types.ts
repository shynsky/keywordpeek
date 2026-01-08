export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      keywords: {
        Row: {
          id: string;
          project_id: string;
          keyword: string;
          search_volume: number | null;
          difficulty: number | null;
          cpc: number | null;
          keyword_score: number | null;
          data: Json | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          keyword: string;
          search_volume?: number | null;
          difficulty?: number | null;
          cpc?: number | null;
          keyword_score?: number | null;
          data?: Json | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          keyword?: string;
          search_volume?: number | null;
          difficulty?: number | null;
          cpc?: number | null;
          keyword_score?: number | null;
          data?: Json | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "keywords_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          description: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          description?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: string;
          description?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      api_usage: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          credits_used: number;
          keywords_count: number | null;
          request_data: Json | null;
          response_status: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          credits_used: number;
          keywords_count?: number | null;
          request_data?: Json | null;
          response_status?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          credits_used?: number;
          keywords_count?: number | null;
          request_data?: Json | null;
          response_status?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "api_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      keyword_cache: {
        Row: {
          keyword: string;
          location_code: number;
          language_code: string;
          data: Json;
          fetched_at: string;
        };
        Insert: {
          keyword: string;
          location_code?: number;
          language_code?: string;
          data: Json;
          fetched_at?: string;
        };
        Update: {
          keyword?: string;
          location_code?: number;
          language_code?: string;
          data?: Json;
          fetched_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type?: string;
          p_description?: string | null;
          p_stripe_session_id?: string | null;
        };
        Returns: number;
      };
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description?: string | null;
        };
        Returns: number;
      };
      has_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
        };
        Returns: boolean;
      };
      get_credit_balance: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier use
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Keyword = Database["public"]["Tables"]["keywords"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type ApiUsage = Database["public"]["Tables"]["api_usage"]["Row"];
export type KeywordCache = Database["public"]["Tables"]["keyword_cache"]["Row"];

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type KeywordInsert = Database["public"]["Tables"]["keywords"]["Insert"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type ApiUsageInsert = Database["public"]["Tables"]["api_usage"]["Insert"];
export type KeywordCacheInsert = Database["public"]["Tables"]["keyword_cache"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
export type KeywordUpdate = Database["public"]["Tables"]["keywords"]["Update"];

// Keyword status enum
export type KeywordStatus = "saved" | "targeting" | "published";

// Transaction type enum
export type TransactionType = "purchase" | "usage" | "bonus" | "refund";
