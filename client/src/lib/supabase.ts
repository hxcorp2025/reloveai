import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vfcviypitmkarbsuuehj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmY3ZpeXBpdG1rYXJic3V1ZWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE4MjUsImV4cCI6MjA3ODQ1NzgyNX0.SbX6qRCLAYf-h0HDdKFul9YnuLbssTh_C1flkWx0Kv8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
