import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          item_name: string;
          category: string | null;
          default_supplier: string | null;
          supplier_alternative: string | null;
          order_quantity: string | null;
          measure_unit: string | null;
          default_quantity: string | null;
          brand_tag: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['items']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          icon: string;
          parent_id: string | null;
          level: 'parent' | 'main' | 'category' | 'subcategory';
          order_number: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact: string | null;
          email: string | null;
          color: string;
          active: boolean;
          categories: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>;
      };
      carts: {
        Row: {
          id: string;
          cart_name: string;
          telegram_user_id: number;
          is_template: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['carts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['carts']['Insert']>;
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          item_name: string;
          quantity: number;
          category: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          cart_id: string | null;
          telegram_user_id: number;
          telegram_message_id: number | null;
          telegram_chat_id: number | null;
          team_tags: string[];
          delivery_type: string | null;
          payment_method: string | null;
          status: string;
          supplier_id: string | null;
          invoice_amount: number | null;
          invoice_file_id: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_name: string;
          quantity: number;
          category: string | null;
          is_available: boolean;
          is_confirmed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
  };
};
