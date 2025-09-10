import { supabase } from './supabase';
import type { CallData, Lead, DashboardMetrics } from './types';

// Re-export types for backward compatibility
export type { CallData, Lead, DashboardMetrics } from './types';

const INITIAL_BALANCE = 5000; // ₹5000 starting balance

// Save call data to the database
export async function saveCallData(call: CallData) {
  const startTime = Date.now();
  const callId = call.id || 'unknown';
  
  try {
    
    console.log(`💽 [${new Date().toISOString()}] Starting database save for call:`, {
      id: callId,
      caller: call.caller_name,
      timestamp: new Date(call.call_start).toISOString(),
      duration: call.duration,
      cost: call.cost
    });

    // First check if a record with this ID already exists
    console.log(`🔍 [${callId}] Checking for existing record...`);
    const { data: existingRecord, error: checkError } = await supabase
      .from('calls')
      .select('id, call_start, caller_name')
      .eq('id', callId)
      .limit(1);
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
      console.error(`❌ [${callId}] Error checking for existing record:`, checkError);
      throw checkError;
    }
    
    console.log(`🔍 [${callId}] Existing record check:`, {
      exists: existingRecord && existingRecord.length > 0,
      existingData: existingRecord && existingRecord[0] || null
    });

    // Only insert if the record doesn't exist
    if (!existingRecord || existingRecord.length === 0) {
      console.log(`📝 [${callId}] No existing record found, preparing to insert...`);
      
      const insertData = {
        id: callId,
        caller_name: call.caller_name,
        phone: call.phone || '',
        call_start: new Date(call.call_start).toISOString(),
        call_end: new Date(call.call_end).toISOString(),
        duration: call.duration,
        transcript: call.transcript || '', // Ensure transcript is never null
        summary: call.summary || '', // Include summary field
        success_flag: call.success_flag,
        cost: call.cost,
        // Real Estate specific fields
        client_status: call.client_status || 'unknown',
        property_interest: call.property_interest || '',
        lead_quality: call.lead_quality || 'cold',
        follow_up_date: call.follow_up_date ? new Date(call.follow_up_date).toISOString() : null,
        agent_notes: call.agent_notes || '',
        ultravox_call_id: call.ultravox_call_id || callId
      };
      
      console.log(`📥 [${callId}] Inserting call data:`, JSON.stringify(insertData, null, 2));
      
      const { data: result, error: insertError } = await supabase
        .from('calls')
        .insert([insertData])
        .select('id, call_start, caller_name');
      
      if (insertError) {
        console.error(`❌ [${callId}] Error inserting call data:`, insertError);
        throw insertError;
      }
      
      const insertedRecord = result && result[0];
      console.log(`✅ [${callId}] Successfully created record:`, {
        id: insertedRecord.id,
        caller: insertedRecord.caller_name,
        timestamp: insertedRecord.call_start,
        duration: Date.now() - startTime + 'ms'
      });
      
      return { success: true, id: insertedRecord.id };
    } else {
      const existing = existingRecord[0];
      console.log(`ℹ️ [${callId}] Record already exists, skipping insert. Details:`, {
        existingCaller: existing.caller_name,
        existingTimestamp: existing.call_start,
        newCaller: call.caller_name,
        newTimestamp: call.call_start
      });
      return { success: true, id: callId, existing: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`❌ [${callId}] Error in saveCallData (${Date.now() - startTime}ms):`, {
      error: errorMessage,
      stack: errorStack,
      callData: {
        id: callId,
        caller: call.caller_name,
        start: call.call_start,
        duration: call.duration,
        cost: call.cost
      }
    });
    
    // Re-throw the error with additional context
    const dbError = new Error(`Failed to save call ${callId}: ${errorMessage}`);
    (dbError as any).originalError = error;
    (dbError as any).callId = callId;
    throw dbError;
  }
}

// Define the database row type
interface DBCallRow {
  id: string;
  caller_name: string | null;
  phone: string | null;
  call_start: string | Date;
  call_end: string | Date;
  duration: string;
  transcript: string | null;
  success_flag: boolean | null;
  cost: number;
  created_at: string | Date;
}

// Get all calls from the database
export async function getAllCalls(): Promise<CallData[]> {
  try {
    console.log('🔍 Fetching all calls from Supabase...');
    
    // Use Supabase client to fetch calls
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('call_start', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log(`✅ Successfully retrieved ${data?.length || 0} calls`);
    
    return (data || []).map((row: any) => {
      // Ensure all required fields are present and properly formatted
      const callData: CallData = {
        id: row.id,
        caller_name: row.caller_name || 'Unknown Caller',
        phone: row.phone || '',
        call_start: new Date(row.call_start),
        call_end: new Date(row.call_end),
        duration: row.duration || 0,
        transcript: row.transcript || '',
        summary: row.summary || '',
        success_flag: row.success_flag || false,
        cost: Number(row.cost) || 0,
        // Real Estate specific fields
        client_status: row.client_status || 'unknown',
        property_interest: row.property_interest || '',
        lead_quality: row.lead_quality || 'cold',
        follow_up_date: row.follow_up_date ? new Date(row.follow_up_date) : undefined,
        agent_notes: row.agent_notes || '',
        ultravox_call_id: row.ultravox_call_id || row.id
      };
      
      console.log(`📝 Processed call ${callData.id}:`, {
        caller: callData.caller_name,
        start: callData.call_start,
        duration: callData.duration,
        success: callData.success_flag
      });
      
      return callData;
    });
  } catch (error) {
    console.error('❌ Error fetching calls:', error);
    // Return empty array instead of throwing to prevent dashboard from breaking
    return [];
  }
}

// Get all leads from the database
export async function getAllLeads(): Promise<Lead[]> {
  try {
    console.log('🔍 Fetching all leads from Supabase...');
    
    // Use Supabase client to fetch leads
    const { data, error } = await supabase
      .from('Leads')
      .select('"Owner Name", "Mobile No"')
      .order('Owner Name', { ascending: true });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log(`✅ Successfully retrieved ${data?.length || 0} leads`);
    console.log('🔍 First few rows:', data?.slice(0, 3));
    
    return (data || []).map((row: any) => {
      const lead: Lead = {
        "Owner Name": row["Owner Name"] || null,
        "Mobile No": row["Mobile No"] || null
      };
      
      return lead;
    });
    
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return empty array instead of throwing to prevent dashboard from breaking
    return [];
  }
}

// For backward compatibility
export async function fetchWebhookData(): Promise<CallData[]> {
  return getAllCalls();
}

// Format seconds into "Xm Ys" format
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0m 0s'
  }
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hours = Math.floor(mins / 60)
  
  if (hours > 0) {
    return `${hours}h ${mins % 60}m ${secs}s`
  }
  
  return `${mins}m ${secs}s`
}

// Calculate duration between two dates in seconds
function calculateDuration(startTime: string | Date, endTime: string | Date): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const durationMs = end - start
  
  if (isNaN(durationMs) || durationMs < 0) {
    return 0
  }
  
  return Math.floor(durationMs / 1000)
}

export async function calculateMetrics(data: CallData[]): Promise<DashboardMetrics> {
  console.log('📊 Calculating metrics for', data.length, 'calls');
  
  // Filter out any invalid data
  const validCalls = data.filter(call => call && call.id);
  const totalCalls = validCalls.length;
  
  // Count successful calls (only count explicitly true, not just truthy)
  const successfulCalls = validCalls.filter(call => call.success_flag === true).length;
  
  // Calculate total cost, ensuring cost is a number
  const totalCost = validCalls.reduce((sum, call) => {
    const cost = typeof call.cost === 'number' ? call.cost : 0;
    return sum + cost;
  }, 0);
  
  // Calculate total duration in seconds
  const totalDurationSeconds = validCalls.reduce((total, call) => {
    if (call.duration === undefined || call.duration === null) return total;
    
    if (typeof call.duration === 'number') {
      return total + call.duration;
    } 
    
    if (typeof call.duration === 'string') {
      // Try to parse string duration (e.g., "2m 30s" or "2:30")
      const match = call.duration.match(/(\d+)m\s*(\d*)s?/);
      if (match) {
        const minutes = parseInt(match[1]) || 0;
        const seconds = parseInt(match[2]) || 0;
        return total + (minutes * 60) + seconds;
      }
      
      // Try to parse as seconds number
      const seconds = parseFloat(call.duration);
      if (!isNaN(seconds)) {
        return total + seconds;
      }
    }
    
    return total;
  }, 0);
  
  // Calculate average duration
  const avgCallDurationSeconds = totalCalls > 0 ? Math.round(totalDurationSeconds / totalCalls) : 0;
  const avgCallDuration = formatDuration(avgCallDurationSeconds);
  
  // Calculate success rate (as a percentage)
  const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
  
  // Calculate remaining balance (starting balance - total cost)
  // Ensure we don't go below 0 and handle any floating point precision
  const remainingBalance = Math.max(0, Math.round((INITIAL_BALANCE - totalCost) * 100) / 100);
  
  // Calculate average call cost
  const avgCallCost = totalCalls > 0 ? totalCost / totalCalls : 0;
  
  // Format numbers with Indian numbering system
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('₹', '₹')
  }

  const currentBalance = INITIAL_BALANCE - totalCost
  const avgCallCostValue = totalCalls > 0 ? (totalCost / totalCalls) : 0
  
  // Calculate real estate specific metrics
  const interestedLeads = data.filter(call => 
    call.success_flag && (
      call.transcript?.toLowerCase().includes('interested') ||
      call.summary?.toLowerCase().includes('interested')
    )
  ).length;
  
  const appointmentsScheduled = data.filter(call => 
    call.transcript?.toLowerCase().includes('appointment') ||
    call.summary?.toLowerCase().includes('schedule')
  ).length;
  
  const callbacksRequested = data.filter(call => 
    call.transcript?.toLowerCase().includes('callback') ||
    call.summary?.toLowerCase().includes('call back')
  ).length;
  
  const hotLeads = data.filter(call => 
    call.lead_quality === 'hot'
  ).length;

  return {
    totalCalls,
    avgCallDuration,
    totalBalance: formatINR(currentBalance),
    avgCallCost: formatINR(avgCallCostValue),
    successRate: totalCalls > 0 ? `${Math.round((successfulCalls / totalCalls) * 100)}%` : '0%',
    interestedLeads,
    appointmentsScheduled,
    callbacksRequested,
    hotLeads,
    lastRefreshed: new Date().toLocaleTimeString()
  }
}

// Function to get chart data for calls per day
export function getCallsPerDayData(data: CallData[]) {
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return date
  })

  return last14Days.map(date => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const callsOnDate = data.filter(call => {
      try {
        const callDate = new Date(call.call_start)
        return callDate.toDateString() === date.toDateString()
      } catch (e) {
        console.error('Error parsing call date:', call.call_start, e)
        return false
      }
    }).length

    return {
      date: dateStr,
      calls: callsOnDate
    }
  })
}

// Function to get call duration distribution data
export function getCallDurationData(data: CallData[]) {
  let shortCalls = 0
  let mediumCalls = 0
  let longCalls = 0

  data.forEach(call => {
    let minutes = 0
    
    if (typeof call.duration === 'number') {
      // Duration is in seconds, convert to minutes
      minutes = call.duration / 60
    } else if (typeof call.duration === 'string') {
      // Parse duration string (e.g., "2m 30s")
      const match = call.duration.match(/(\d+)m\s*(\d*)s?/)
      if (match) {
        minutes = parseInt(match[1]) || 0
        const seconds = parseInt(match[2]) || 0
        minutes += seconds / 60
      }
    }

    if (minutes < 1) {
      shortCalls++
    } else if (minutes <= 3) {
      mediumCalls++
    } else {
      longCalls++
    }
  })

  return [
    { name: "< 1 min", value: shortCalls, color: "#06B6D4" },
    { name: "1-3 min", value: mediumCalls, color: "#8B5CF6" },
    { name: "> 3 min", value: longCalls, color: "#F59E0B" },
  ]
}
