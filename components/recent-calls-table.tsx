"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { PhoneCall } from "lucide-react"
import { type CallData } from "@/lib/webhook-service"

// Helper function to format duration (handles both string and number types)
function formatDuration(duration: string | number): string {
  if (typeof duration === 'number') {
    // Convert seconds to "Xm Ys" format
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}m ${seconds}s`
  }
  
  // If it's already a string, return as is
  return duration
}

interface RecentCallsTableProps {
  callData: CallData[]
}

export function RecentCallsTable({ callData }: RecentCallsTableProps) {
  // Process call data with proper fallbacks
  const recentCalls = callData.slice(0, 20).map(call => {
    // Use summary if available, otherwise fall back to transcript if it exists
    const summary = call.summary || call.transcript || 'No summary available';
    
    return {
      id: call.id,
      caller_name: call.caller_name || 'Unknown Caller',
      phone: call.phone || 'N/A',
      duration: call.duration,
      cost: call.cost || 0, // Ensure cost is always a number
      timestamp: new Date(call.call_start),
      summary: summary,
      success: call.success_flag,
      client_status: call.client_status || 'unknown',
      property_interest: call.property_interest || '',
      lead_quality: call.lead_quality || 'cold'
    };
  })

  if (recentCalls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <PhoneCall className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls yet</h3>
          <p className="text-gray-500 text-sm">
            Waiting for Ultravox AI webhook data. Once calls are made, they'll appear here with detailed analytics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="font-semibold text-gray-700 py-4">Caller</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4 hidden md:table-cell">Phone</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4 hidden sm:table-cell">Duration</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Time</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4 hidden lg:table-cell">Property</TableHead>
            <TableHead className="font-semibold text-gray-700 py-4">Conversation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentCalls.map((call) => {
            // Enhanced interest level logic
            const getStatusInfo = () => {
              // Use client_status if available, otherwise fall back to old logic
              if (call.client_status) {
                switch (call.client_status) {
                  case 'appointment_scheduled':
                    return { level: 'Appointment', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '📅' };
                  case 'interested':
                    return { level: 'High Interest', color: 'bg-green-50 text-green-700 border-green-200', icon: '⭐' };
                  case 'callback_requested':
                    return { level: 'Callback', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📞' };
                  case 'not_interested':
                    return { level: 'Not Interested', color: 'bg-red-50 text-red-700 border-red-200', icon: '❌' };
                  case 'no_answer':
                    return { level: 'No Answer', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '📵' };
                  default:
                    return { level: 'Unknown', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '❓' };
                }
              }
              
              // Fallback to old logic
              if (call.success === true) {
                const transcript = call.summary.toLowerCase();
                if (transcript.includes('interested') || transcript.includes('schedule') || transcript.includes('appointment')) {
                  return { level: 'High Interest', color: 'bg-green-50 text-green-700 border-green-200', icon: '⭐' };
                } else if (transcript.includes('maybe') || transcript.includes('think about') || transcript.includes('call back')) {
                  return { level: 'Warm Lead', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '🤔' };
                }
              }
              return { level: 'No Interest', color: 'bg-red-50 text-red-700 border-red-200', icon: '❌' };
            };
            
            const statusInfo = getStatusInfo();
            
            return (
              <TableRow
                key={call.id}
                className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 border-b border-gray-50 transition-all duration-200"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-sm font-semibold text-violet-700">
                      {call.caller_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{call.caller_name}</div>
                      <div className="text-xs text-gray-500 md:hidden">{call.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4 text-gray-600">{call.phone}</TableCell>
                <TableCell className="hidden sm:table-cell py-4 text-gray-600 font-mono text-sm">{formatDuration(call.duration)}</TableCell>
                <TableCell className="py-4 text-gray-600 text-sm">{formatDistanceToNow(call.timestamp, { addSuffix: true })}</TableCell>
                <TableCell className="py-4">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border ${statusInfo.color}`}>
                    <span>{statusInfo.icon}</span>
                    {statusInfo.level}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell py-4 text-gray-600 text-sm">
                  {call.property_interest || 'Not specified'}
                </TableCell>
                <TableCell className="py-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-left truncate cursor-pointer text-violet-600 hover:text-violet-800 hover:underline max-w-[250px] text-sm group-hover:text-violet-700 transition-colors">
                        {call.summary.length > 60 ? call.summary.substring(0, 60) + '...' : call.summary}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {call.caller_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>Call Details - {call.caller_name}</div>
                            <div className="text-sm font-normal text-gray-500">
                              {call.timestamp.toLocaleDateString()} at {call.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact Info</div>
                            <div className="font-medium text-gray-900">{call.caller_name}</div>
                            <div className="text-sm text-gray-600">{call.phone}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Call Metrics</div>
                            <div className="font-medium text-gray-900">{formatDuration(call.duration)}</div>
                            <div className="text-sm text-gray-600">₹{typeof call.cost === 'number' ? call.cost.toFixed(2) : call.cost}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</div>
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border ${statusInfo.color}`}>
                              <span>{statusInfo.icon}</span>
                              {statusInfo.level}
                            </span>
                          </div>
                        </div>
                        
                        {call.property_interest && (
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Property Interest</div>
                            <div className="text-blue-800 font-medium">{call.property_interest}</div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-3">Call Conversation</div>
                          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm leading-relaxed max-h-96 overflow-y-auto">
                            {call.summary || 'No transcript available'}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            )})}
        </TableBody>
      </Table>
    </div>
  )
}
