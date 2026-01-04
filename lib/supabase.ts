import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Solo crear cliente si las variables de entorno están configuradas
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = !!supabase;

// Tipos para la base de datos
export interface DbProperty {
  id: string;
  name: string;
  address: string;
  description: string;
  image_url: string;
  color: string;
}

export interface DbGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  document_id: string;
  notes: string;
}

export interface DbBooking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  payment_status: 'pending' | 'partial' | 'paid';
  status: 'confirmed' | 'cancelled' | 'completed';
  notes: string;
}
