import { createClient } from '@supabase/supabase-js';

// Debug logs
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Loaded' : 'Missing');
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Loaded' : 'Missing');

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration. Please check your .env file');
}

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const supabaseClient = {
  supabase: createClient(url, key, { 
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    // Realtime configuration - using default settings
    global: {
      fetch: fetch.bind(globalThis),
      headers: { 'X-Client-Info': 'supabase-js/2.0.0' }
    }
  }),
  TABLES: {
    MESSAGES: 'chat_messages',
    USERS: 'chat_users'
  } as const
};

export const { supabase, TABLES } = supabaseClient;
export default supabaseClient;