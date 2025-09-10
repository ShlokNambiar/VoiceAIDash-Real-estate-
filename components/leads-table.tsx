"use client"

import { useState, useMemo } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Search, 
  Phone, 
  Edit3, 
  Download,
  Filter,
  ArrowUpDown
} from "lucide-react"
import { Lead } from "@/lib/webhook-service"

interface LeadsTableProps {
  leadsData: Lead[]
}

export function LeadsTable({ leadsData }: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<'name' | 'mobile'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leadsData.filter(lead => {
      const query = searchQuery.toLowerCase()
      const name = (lead["Owner Name"] || '').toLowerCase()
      const mobile = (lead["Mobile No"] || '').toString().toLowerCase()
      return name.includes(query) || mobile.includes(query)
    })

    // Sort leads
    filtered.sort((a, b) => {
      let aValue = ''
      let bValue = ''
      
      if (sortField === 'name') {
        aValue = (a["Owner Name"] || '').toLowerCase()
        bValue = (b["Owner Name"] || '').toLowerCase()
      } else {
        aValue = (a["Mobile No"] || '').toString()
        bValue = (b["Mobile No"] || '').toString()
      }
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    return filtered
  }, [leadsData, searchQuery, sortField, sortDirection])

  // Paginate leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedLeads.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedLeads, currentPage])

  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage)

  const handleSort = (field: 'name' | 'mobile') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
            <Users className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No leads available</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your lead database is empty. Once you add leads to your Supabase "Leads" table, 
            they will appear here with search and filtering capabilities.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Add leads to the "Leads" table in your Supabase database to see them here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search leads by name or mobile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 bg-white/50 border-gray-200/50 focus:bg-white/80 focus:border-emerald-200"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white/50 border-gray-200/50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="bg-white/50 border-gray-200/50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          Found <strong>{filteredAndSortedLeads.length}</strong> leads matching "{searchQuery}"
        </div>
      )}

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-sm border-0 shadow-xl overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
              <TableHead className="font-semibold text-gray-700 py-4">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                >
                  Owner Name
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">
                <button 
                  onClick={() => handleSort('mobile')}
                  className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                >
                  Mobile Number
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {paginatedLeads.map((lead, index) => (
            <TableRow 
              key={index}
              className="group hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/50 border-b border-gray-50 transition-all duration-200"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                    {(lead["Owner Name"] || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {lead["Owner Name"] || 'Unknown Owner'}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
                  {lead["Mobile No"] ? (
                    <a 
                      href={`tel:+91${lead["Mobile No"]}`}
                      className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline font-mono flex items-center gap-2 group-hover:text-emerald-700 transition-colors"
                      title={`Call ${formatMobileNumber(lead["Mobile No"])}`}
                    >
                      <Phone className="h-3 w-3" />
                      {formatMobileNumber(lead["Mobile No"])}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      No mobile number
                    </span>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="py-4">
                <div className="flex space-x-2">
                  {lead["Mobile No"] && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-3 py-1"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 px-3 py-1"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-emerald-50/30 to-green-50/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to{' '}
                <strong>{Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)}</strong> of{' '}
                <strong>{filteredAndSortedLeads.length}</strong> leads
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/50 border-gray-200/50"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-emerald-600 text-white" 
                          : "bg-white/50 border-gray-200/50"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-white/50 border-gray-200/50"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary footer */}
        <div className="border-t border-gray-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50 px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {searchQuery ? (
                <>Found <strong>{filteredAndSortedLeads.length}</strong> of <strong>{leadsData.length}</strong> total leads</>
              ) : (
                <>Total <strong>{leadsData.length}</strong> leads in database</>
              )}
            </div>
            <div className="text-gray-500 text-xs">
              Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}