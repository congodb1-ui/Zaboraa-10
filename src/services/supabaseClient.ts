import { supabase, isSupabaseConfigured, User } from '../lib/supabase';

export { supabase, isSupabaseConfigured };
export type { User as SupabaseUser };

export interface SupabaseUserProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url?: string | null;
  role?: 'user' | 'admin';
  subscription_tier?: 'free' | 'pro' | 'enterprise';
}
