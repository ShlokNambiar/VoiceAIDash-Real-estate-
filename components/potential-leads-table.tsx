"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Users, Phone, Clock, CheckCircle } from "lucide-react"

interface PotentialLead {
  serialNo: number
  customerName: string
  phoneNumber: string
  callDate: string
  followUpStatus: string
  agentNotes: string
}

// Real data from INTERESTED_LEADS_FINAL.csv
const potentialLeadsData: PotentialLead[] = [
  { serialNo: 1, customerName: "Nidhi Macvin Farro", phoneNumber: "9987050780", callDate: "20-09-2025", followUpStatus: "SITE VISIT SCHEDULED", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 2, customerName: "CHANDULAL PIRARAM JOSHI", phoneNumber: "9867996642", callDate: "21-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 3, customerName: "RAVI VASUDEV VYAS", phoneNumber: "9029856279", callDate: "19-09-2025", followUpStatus: "REQUESTED BROCHURE", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 4, customerName: "MAHENDRA AGARWATH", phoneNumber: "9833512947", callDate: "17-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 5, customerName: "RAJESH BIHARILAL MITTAL", phoneNumber: "8779532850", callDate: "18-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 6, customerName: "Yashal Hemant Shah", phoneNumber: "9920019555", callDate: "20-09-2025", followUpStatus: "REQUESTED BROCHURE", agentNotes: "Customer responded positively to apartment presentation. Budget confirmed" },
  { serialNo: 7, customerName: "BHUPENDRA DALSUKH PATEL", phoneNumber: "9324545222", callDate: "17-09-2025", followUpStatus: "SITE VISIT SCHEDULED", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 8, customerName: "NARESH BHIM SINGH RAJPUROHIT", phoneNumber: "9892547929", callDate: "17-09-2025", followUpStatus: "PRICE NEGOTIATION", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 9, customerName: "KISHOR TULSANI", phoneNumber: "9323592930", callDate: "18-09-2025", followUpStatus: "REQUESTED BROCHURE", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 10, customerName: "AMARSINGH JANGIR", phoneNumber: "9820002637", callDate: "21-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 11, customerName: "PRADEEP JASWANTRAJ MEHTA", phoneNumber: "9022575682", callDate: "21-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 12, customerName: "PRAKASH HAMIRMAL JAIN", phoneNumber: "9820613501", callDate: "21-09-2025", followUpStatus: "REQUESTED BROCHURE", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 13, customerName: "RAJESH SHANTARAM HATANKAR", phoneNumber: "9920892255", callDate: "20-09-2025", followUpStatus: "PRICE NEGOTIATION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 14, customerName: "CHINKU VINOD JAIN", phoneNumber: "9819916507", callDate: "17-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 15, customerName: "MUKESHKUMAR MANGILAL SHAH", phoneNumber: "9920850101", callDate: "21-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 16, customerName: "Mikhail Xavier Ambrose Rodricks", phoneNumber: "9930791306", callDate: "20-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Budget confirmed" },
  { serialNo: 17, customerName: "DINESHCHANDRA SAKALCHAND JAIN", phoneNumber: "9819855583", callDate: "20-09-2025", followUpStatus: "SITE VISIT SCHEDULED", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 18, customerName: "MATHILDA CREADO", phoneNumber: "9930565189", callDate: "17-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 19, customerName: "Manish Surendra Pachlangia", phoneNumber: "9079004368", callDate: "20-09-2025", followUpStatus: "SITE VISIT SCHEDULED", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 20, customerName: "LATA DINESH RATHOD", phoneNumber: "9004582189", callDate: "17-09-2025", followUpStatus: "PRICE NEGOTIATION", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 21, customerName: "BHARAT VAGHJIBHAI VOHERA", phoneNumber: "9930354186", callDate: "18-09-2025", followUpStatus: "PENDING CALLBACK", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 22, customerName: "JENIFFER JULIO FERNANDES", phoneNumber: "9673111387", callDate: "19-09-2025", followUpStatus: "PENDING CALLBACK", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 23, customerName: "Raghunath Balu Tarmale", phoneNumber: "7021955679", callDate: "19-09-2025", followUpStatus: "SITE VISIT SCHEDULED", agentNotes: "Customer responded positively to apartment presentation. Budget confirmed" },
  { serialNo: 24, customerName: "BHAVYA SHAILESH GAGLANI", phoneNumber: "7208510690", callDate: "18-09-2025", followUpStatus: "REQUESTED BROCHURE", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 25, customerName: "MUKESHKUMAR BANSHILAL BAHETI", phoneNumber: "9869741224", callDate: "18-09-2025", followUpStatus: "PENDING CALLBACK", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 26, customerName: "JAYENDRASINH MAVSINH MORI", phoneNumber: "9969543374", callDate: "18-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 27, customerName: "UTTAM CHAMPALAL RATHOD", phoneNumber: "9820520279", callDate: "17-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 28, customerName: "BHAVIN MUKESH PAREKH", phoneNumber: "9619209625", callDate: "18-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 29, customerName: "DIVYANSH DINESHKUMAR BORANA", phoneNumber: "8879716710", callDate: "20-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 30, customerName: "DILIP BHAGAVATILAL RANKA", phoneNumber: "8080401900", callDate: "19-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Comparing options" },
  { serialNo: 31, customerName: "MR.BHARAT SATYANARAYAN SWAMI", phoneNumber: "9987849434", callDate: "17-09-2025", followUpStatus: "PENDING CALLBACK", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 32, customerName: "SUNITA SOLANKI", phoneNumber: "9324060160", callDate: "17-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 33, customerName: "NAMDEVVANSHIKUMAR NARAYAN SAWANT", phoneNumber: "7039033456", callDate: "19-09-2025", followUpStatus: "PENDING CALLBACK", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 34, customerName: "RAJAN BIPIN BHAI PATEL", phoneNumber: "9833279990", callDate: "21-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 35, customerName: "BHAVESH MOTILAL JAIN", phoneNumber: "9869656530", callDate: "19-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 36, customerName: "ASHOK KUMAR GIRDHARLAL PATEL", phoneNumber: "9820066459", callDate: "19-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 37, customerName: "VIJETA  GIRI", phoneNumber: "9892009696", callDate: "19-09-2025", followUpStatus: "PRICE NEGOTIATION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" },
  { serialNo: 38, customerName: "RAJ H JUMANI", phoneNumber: "8850374949", callDate: "17-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Genuine buyer" },
  { serialNo: 39, customerName: "Deepakrao Swaminath Bharti", phoneNumber: "9769929050", callDate: "20-09-2025", followUpStatus: "DOCUMENTATION PENDING", agentNotes: "Customer responded positively to apartment presentation. Serious inquiry" },
  { serialNo: 40, customerName: "AMIT BAJRANGLAL TOSHNIWAL", phoneNumber: "9820288862", callDate: "17-09-2025", followUpStatus: "AWAITING DECISION", agentNotes: "Customer responded positively to apartment presentation. Ready to visit" }
]

export function PotentialLeadsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'site_visit' | 'awaiting' | 'brochure' | 'documentation' | 'negotiation' | 'callback'>('all')

  // Filter leads based on search and status
  const filteredLeads = potentialLeadsData.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phoneNumber.includes(searchQuery) ||
                         lead.agentNotes.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'site_visit' && lead.followUpStatus === 'SITE VISIT SCHEDULED') ||
                         (statusFilter === 'awaiting' && lead.followUpStatus === 'AWAITING DECISION') ||
                         (statusFilter === 'brochure' && lead.followUpStatus === 'REQUESTED BROCHURE') ||
                         (statusFilter === 'documentation' && lead.followUpStatus === 'DOCUMENTATION PENDING') ||
                         (statusFilter === 'negotiation' && lead.followUpStatus === 'PRICE NEGOTIATION') ||
                         (statusFilter === 'callback' && lead.followUpStatus === 'PENDING CALLBACK')

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SITE VISIT SCHEDULED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Site Visit Scheduled
        </Badge>
      case 'AWAITING DECISION':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Awaiting Decision
        </Badge>
      case 'REQUESTED BROCHURE':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Search className="h-3 w-3 mr-1" />
          Requested Brochure
        </Badge>
      case 'DOCUMENTATION PENDING':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
          <Users className="h-3 w-3 mr-1" />
          Documentation Pending
        </Badge>
      case 'PRICE NEGOTIATION':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
          <Phone className="h-3 w-3 mr-1" />
          Price Negotiation
        </Badge>
      case 'PENDING CALLBACK':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending Callback
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (potentialLeadsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No potential leads yet</h3>
          <p className="text-gray-500 text-sm">
            Interested leads from your calls will appear here for follow-up.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search leads by name, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-white/50 border-gray-200/50 focus:bg-white/80 focus:border-emerald-200"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-md border border-gray-200/50 bg-white/50 text-sm"
          >
            <option value="all">All Status</option>
            <option value="site_visit">Site Visit Scheduled</option>
            <option value="awaiting">Awaiting Decision</option>
            <option value="brochure">Requested Brochure</option>
            <option value="documentation">Documentation Pending</option>
            <option value="negotiation">Price Negotiation</option>
            <option value="callback">Pending Callback</option>
          </select>
        </div>
      </div>



      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          Found <strong>{filteredLeads.length}</strong> leads matching "{searchQuery}"
        </div>
      )}

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-sm border-0 shadow-xl overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
              <TableHead className="font-semibold text-gray-700 py-4">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4 hidden md:table-cell">Phone</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4 hidden sm:table-cell">Call Date</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4 hidden lg:table-cell">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow 
                key={lead.serialNo}
                className="group hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/50 border-b border-gray-50 transition-all duration-200"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                      {lead.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{lead.customerName}</div>
                      <div className="text-xs text-gray-500 md:hidden">+91-{lead.phoneNumber.slice(0, 5)}-{lead.phoneNumber.slice(5)}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="hidden md:table-cell py-4">
                  <a 
                    href={`tel:+91${lead.phoneNumber}`}
                    className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline font-mono flex items-center gap-2"
                  >
                    <Phone className="h-3 w-3" />
                    +91-{lead.phoneNumber.slice(0, 5)}-{lead.phoneNumber.slice(5)}
                  </a>
                </TableCell>
                
                <TableCell className="hidden sm:table-cell py-4 text-gray-600 text-sm">
                  {lead.callDate}
                </TableCell>
                
                <TableCell className="hidden lg:table-cell py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate" title={lead.agentNotes}>
                    {lead.agentNotes || 'No notes'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Summary footer */}
        <div className="border-t border-gray-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50 px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {searchQuery ? (
                <>Found <strong>{filteredLeads.length}</strong> of <strong>{potentialLeadsData.length}</strong> total leads</>
              ) : (
                <>Total <strong>{potentialLeadsData.length}</strong> potential leads</>
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