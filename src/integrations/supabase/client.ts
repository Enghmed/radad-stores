import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jchcpswvlpdatudrstzl.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaGNwc3d2bHBkYXR1ZHJzdHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzY3NDcsImV4cCI6MjA5MDQ1Mjc0N30.7PAp5xmNEUlWvxJKr2BA_zsas2gpaIW1tlN8LOQFQrg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
