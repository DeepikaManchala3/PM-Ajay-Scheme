// Supabase configuration utility
// Use this instead of hardcoding credentials

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper function to create headers for Supabase REST API calls
export const getSupabaseHeaders = () => ({
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
});

// Validate that environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
}
