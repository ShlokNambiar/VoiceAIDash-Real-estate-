"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Lead } from "@/lib/webhook-service"
import { formatDistanceToNow } from "date-fns"

interface LeadsTableProps {
  leadsData: Lead[]
}

export function LeadsTable({ leadsData }: LeadsTableProps) {
  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'qualified':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'converted':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'lost':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Not specified'
    
    if (budget >= 10000000) { // 1 crore
      return `₹${(budget / 10000000).toFixed(1)} Cr`
    } else if (budget >= 100000) { // 1 lakh
      return `₹${(budget / 100000).toFixed(1)} L`
    } else {
      return `₹${budget.toLocaleString('en-IN')}`
    }
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch (error) {
      return 'Unknown'
    }
  }

  if (leadsData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
          <p className="text-gray-500">No leads have been recorded yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-purple-50 via-pink-25 to-blue-50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Property Interest</TableHead>
            <TableHead className="font-semibold">Budget</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Source</TableHead>
            <TableHead className="font-semibold">Agent</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadsData.map((lead, index) => (
            <TableRow 
              key={lead.id}
              className={`
                hover:bg-gradient-to-r hover:from-purple-25 hover:to-blue-25 transition-all duration-200
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              `}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{lead.name}</span>
                  {lead.notes && (
                    <span className="text-xs text-gray-500 mt-1 line-clamp-2" title={lead.notes}>
                      {lead.notes.length > 50 ? `${lead.notes.substring(0, 50)}...` : lead.notes}
                    </span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col space-y-1">
                  {lead.phone && (
                    <a 
                      href={`tel:${lead.phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      title={`Call ${lead.phone}`}
                    >
                      {lead.phone}
                    </a>
                  )}
                  {lead.email && (
                    <a 
                      href={`mailto:${lead.email}`}
                      className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                      title={`Email ${lead.email}`}
                    >
                      {lead.email.length > 20 ? `${lead.email.substring(0, 20)}...` : lead.email}
                    </a>
                  )}
                  {!lead.phone && !lead.email && (
                    <span className="text-sm text-gray-400">No contact info</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-900">
                  {lead.property_interest || 'Not specified'}
                </span>
              </TableCell>
              
              <TableCell>
                <span className="text-sm font-medium text-gray-900">
                  {formatBudget(lead.budget)}
                </span>
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(lead.status)} border-0 font-medium`}
                >
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-600">
                  {lead.source || 'Unknown'}
                </span>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-600">
                  {lead.assigned_agent || 'Unassigned'}
                </span>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-500" title={new Date(lead.created_at).toLocaleString()}>
                  {formatDate(lead.created_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {leadsData.length > 0 && (
        <div className="border-t bg-gray-50/50 px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {leadsData.length} lead{leadsData.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}