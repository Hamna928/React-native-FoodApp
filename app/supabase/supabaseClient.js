import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and API key
const SUPABASE_URL = 'https://osiwnmrmykfuzniuripy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaXdubXJteWtmdXpuaXVyaXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDY0MTQsImV4cCI6MjA1MDAyMjQxNH0.MLlm4fv6YjvE_CGy-eGzN2AWWQ65KNoXY2PWKXEhnxE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
