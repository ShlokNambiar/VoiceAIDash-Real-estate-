"use client"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Lead } from "@/lib/webhook-service"

interface LeadsTableProps {
  leadsData: Lead[]
}

export function LeadsTable({ leadsData }: LeadsTableProps) {
  const formatMobileNumber = (mobile: number | null) => {
    if (!mobile) return 'Not provided'
    
    const mobileStr = mobile.toString()
    // Format Indian mobile numbers
    if (mobileStr.length === 10) {
      return `+91-${mobileStr.slice(0, 5)}-${mobileStr.slice(5)}`
    }
    return mobileStr
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
            <TableHead className="font-semibold">Owner Name</TableHead>
            <TableHead className="font-semibold">Mobile Number</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadsData.map((lead, index) => (
            <TableRow 
              key={index}
              className={`
                hover:bg-gradient-to-r hover:from-purple-25 hover:to-blue-25 transition-all duration-200
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              `}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    {lead["Owner Name"] || 'Unknown Owner'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col space-y-1">
                  {lead["Mobile No"] ? (
                    <a 
                      href={`tel:+91${lead["Mobile No"]}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      title={`Call ${formatMobileNumber(lead["Mobile No"])}`}
                    >
                      {formatMobileNumber(lead["Mobile No"])}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">No mobile number</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex space-x-2">
                  {lead["Mobile No"] && (
                    <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                      Call
                    </button>
                  )}
                  <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors">
                    Edit
                  </button>
                </div>
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