import type { CallData } from './types';

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
