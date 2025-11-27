import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.create.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.create.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
