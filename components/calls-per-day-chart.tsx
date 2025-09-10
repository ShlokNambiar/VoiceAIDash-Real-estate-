"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BarChart3 } from "lucide-react"
import { getCallsPerDayData, type CallData } from "@/lib/webhook-service"

interface CallsPerDayChartProps {
  callData: CallData[]
}

export function CallsPerDayChart({ callData }: CallsPerDayChartProps) {
  // Only use real webhook data
  const data = getCallsPerDayData(callData)
  
  if (callData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-500 text-sm">No call data available</p>
          <p className="text-gray-400 text-xs mt-1">Chart will appear once calls are made</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              border: "1px solid #E5E7EB",
            }}
            labelStyle={{ fontWeight: "bold", color: "#4B5563" }}
            itemStyle={{ color: "#3B82F6" }}
          />
          <Area
            type="monotone"
            dataKey="calls"
            stroke="#3B82F6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCalls)"
            activeDot={{ r: 6, fill: "#06B6D4", stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
