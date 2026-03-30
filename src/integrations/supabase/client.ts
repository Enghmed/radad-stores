import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://swnawgmvvzbvjhhqrmvu.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bmF3Z212dnpidmpoaHFybXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxODYsImV4cCI6MjA5MDQzOTE4Nn0.Br2jOcKT89rA3ihQ11KjVMdZ4TmpGNFNsh98Ha_woHY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
