"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
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
  const recentCalls = callData.slice(0, 10).map(call => {
    // Use summary if available, otherwise fall back to transcript if it exists
    const summary = call.summary || call.transcript || 'No summary available';
    
    return {
      id: call.id,
      caller_name: call.caller_name,
      phone: call.phone,
      duration: call.duration,
      cost: call.cost || 0, // Ensure cost is always a number
      timestamp: new Date(call.call_start),
      summary: summary,
      success: call.success_flag,
    };
  })

  if (recentCalls.length === 0) {
    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
              <TableHead className="min-w-[100px]">Client Name</TableHead>
              <TableHead className="min-w-[120px] hidden sm:table-cell">Phone</TableHead>
              <TableHead className="min-w-[80px] hidden sm:table-cell">Duration</TableHead>
              <TableHead className="min-w-[100px]">Time</TableHead>
              <TableHead className="min-w-[120px]">Interest Level</TableHead>
              <TableHead className="min-w-[150px]">Transcript</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No call data available. Waiting for Ultravox webhook data...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
            <TableHead className="min-w-[100px]">Caller</TableHead>
            <TableHead className="min-w-[80px] hidden sm:table-cell">Duration</TableHead>
            <TableHead className="min-w-[100px]">Time</TableHead>
            <TableHead className="min-w-[120px]">Interest Level</TableHead>
            <TableHead className="min-w-[200px]">Transcript</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentCalls.map((call) => {
            // Simulate real estate interest level based on success and transcript content
            const getInterestLevel = () => {
              if (call.success === true) {
                const transcript = call.summary.toLowerCase();
                if (transcript.includes('interested') || transcript.includes('schedule') || transcript.includes('appointment')) {
                  return { level: 'High Interest', color: 'bg-green-100 text-green-800 border-green-200' };
                } else if (transcript.includes('maybe') || transcript.includes('think about') || transcript.includes('call back')) {
                  return { level: 'Warm Lead', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
                }
              }
              return { level: 'No Interest', color: 'bg-red-100 text-red-800 border-red-200' };
            };
            
            const interest = getInterestLevel();
            
            return (
            <TableRow
              key={call.id}
              className="hover:bg-gradient-to-r hover:from-purple-25 hover:via-pink-25 hover:to-blue-25"
            >
              <TableCell className="font-medium">{call.caller_name}</TableCell>
              <TableCell className="hidden sm:table-cell">{formatDuration(call.duration)}</TableCell>
              <TableCell className="text-sm">{formatDistanceToNow(call.timestamp, { addSuffix: true })}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${interest.color}`}>
                  {interest.level}
                </span>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="truncate cursor-pointer text-blue-600 hover:text-blue-800 hover:underline max-w-[200px]">
                      {call.summary.length > 50 ? call.summary.substring(0, 50) + '...' : call.summary}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
                    <DialogHeader>
                      <DialogTitle>Call Transcript & Details</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <strong>Client Name:</strong> {call.caller_name || 'Unknown'}
                        </div>
                        <div>
                          <strong>Phone:</strong> {call.phone || 'N/A'}
                        </div>
                        <div>
                          <strong>Duration:</strong> {formatDuration(call.duration)}
                        </div>
                        <div>
                          <strong>Time:</strong> {call.timestamp.toLocaleString()}
                        </div>
                        <div>
                          <strong>Cost:</strong> ₹{typeof call.cost === 'number' ? call.cost.toFixed(2) : call.cost}
                        </div>
                        <div>
                          <strong>Interest Level:</strong> 
                          <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${interest.color}`}>
                            {interest.level}
                          </span>
                        </div>
                        <div className="sm:col-span-2 mt-4">
                          <strong>Full Call Transcript:</strong>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap max-h-80 overflow-y-auto border">
                            {call.summary || 'No transcript available'}
                          </div>
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
