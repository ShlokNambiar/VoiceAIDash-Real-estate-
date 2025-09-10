import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.SUPA_SUPABASE_URL || process.env.SUPA_NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPA_NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: SUPA_SUPABASE_URL and SUPA_SUPABASE_SERVICE_ROLE_KEY')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database table definitions
export interface Lead {
  "Owner Name": string | null
  "Mobile No": number | null
}

export interface CallRecord {
  id: string
  caller_name: string
  phone: string
  call_start: string
  call_end: string
  duration: number
  transcript: string
  summary?: string
  success_flag: boolean
  cost: number
  client_status?: string
  property_interest?: string
  lead_quality?: string
  follow_up_date?: string
  agent_notes?: string
  ultravox_call_id?: string
  created_at?: string
  updated_at?: string
}
