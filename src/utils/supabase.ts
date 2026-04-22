import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!supabaseUrl) {
  throw new Error(
    'Environment variable VITE_SUPABASE_URL is not set. Please define it before starting the application.'
  )
}
if (!supabaseKey) {
  throw new Error(
    'Environment variable VITE_SUPABASE_PUBLISHABLE_KEY is not set. Please define it before starting the application.'
  )
}
export const supabase = createClient(supabaseUrl, supabaseKey)