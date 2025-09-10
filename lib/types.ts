export interface CallData {
  id: string
  caller_name: string
  phone: string
  call_start: Date | string
  call_end: Date | string
  duration: string | number // Can be either string (e.g., "2m 30s") or number (seconds)
  transcript: string
  summary?: string // Optional summary of the call
  success_flag: boolean | null // true = success, false = failed, null = incomplete
  cost: number // Cost in rupees
  // Real Estate specific fields
  client_status: 'interested' | 'not_interested' | 'callback_requested' | 'appointment_scheduled' | 'no_answer' | 'unknown'
  property_interest?: string // Which property they're interested in
  lead_quality: 'hot' | 'warm' | 'cold' | 'unqualified'
  follow_up_date?: Date | string // When to follow up
  agent_notes?: string // Additional notes from the AI agent
  ultravox_call_id?: string // Original Ultravox call ID
}

export interface Lead {
  "Owner Name": string | null
  "Mobile No": number | null
}

export interface DashboardMetrics {
  totalCalls: number
  avgCallDuration: string
  totalBalance: string
  avgCallCost: string
  successRate: string
  interestedLeads: number // Replaces totalReservations
  appointmentsScheduled: number
  callbacksRequested: number
  hotLeads: number
  lastRefreshed: string
}
