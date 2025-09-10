import type { CallData, DashboardMetrics } from './types';

const INITIAL_BALANCE = 5000; // ₹5000 starting balance

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
