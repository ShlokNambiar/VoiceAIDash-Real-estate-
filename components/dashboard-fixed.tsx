"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  RefreshCw, 
  LineChart, 
  PieChart,
  AlertCircle,
  UserCheck,
  PhoneCall,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Zap
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { LeadsTable } from "./leads-table"
import { RecentCallsTable } from "./recent-calls-table"
import { CallsPerDayChart } from "./calls-per-day-chart"
import { CallDurationChart } from "./call-duration-chart"
import { ErrorBoundary } from "./error-boundary"
import { fetchWebhookData, calculateMetrics, getAllLeads, type CallData, type DashboardMetrics, type Lead } from "@/lib/webhook-service"

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCalls: 0,
    avgCallDuration: "0m 0s",
    totalBalance: "₹5,000.00",
    avgCallCost: "₹0.00",
    successRate: "0%",
    interestedLeads: 0,
    appointmentsScheduled: 0,
    callbacksRequested: 0,
    hotLeads: 0,
    lastRefreshed: new Date().toLocaleTimeString(),
  })
  const [callData, setCallData] = useState<CallData[]>([])
  const [leadsData, setLeadsData] = useState<Lead[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch data from database
  const refreshData = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // Fetch both calls and leads in parallel
      const [callsResponse, leadsResponse] = await Promise.all([
        fetch('/api/webhook'),
        fetch('/api/leads')
      ])
      
      // Handle calls data
      if (!callsResponse.ok) {
        const errorText = await callsResponse.text()
        throw new Error(`Failed to fetch calls: ${callsResponse.status} ${callsResponse.statusText} - ${errorText}`)
      }

      const callsData = await callsResponse.json()
      console.log('Calls API Response:', callsData) // Debug log

      if (!callsData.success || !Array.isArray(callsData.data)) {
        throw new Error('Invalid calls data format received from API')
      }

      const processedCalls = callsData.data.map((call: any) => ({
        ...call,
        call_start: new Date(call.call_start),
        call_end: call.call_end ? new Date(call.call_end) : null,
        success_flag: call.success_flag ?? null,
        cost: call.cost ?? 0,
      }))

      // Handle leads data
      const leadsData = await leadsResponse.json()
      console.log('Leads API Response:', leadsData) // Debug log
      
      const processedLeads = Array.isArray(leadsData.data) ? leadsData.data : []

      console.log('Processed calls data:', processedCalls) // Debug log
      console.log('Processed leads data:', processedLeads) // Debug log

      const calculatedMetrics = await calculateMetrics(processedCalls)
      console.log('Calculated metrics:', calculatedMetrics) // Debug log

      setCallData(processedCalls)
      setLeadsData(processedLeads)
      setMetrics(calculatedMetrics)
    } catch (err) {
      setError('Failed to fetch data. Please try again.')
      console.error('Error fetching data:', err)
    } finally {
      setIsRefreshing(false)
      setIsInitialLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    refreshData()
  }, [])

  // Filter call data based on search query
  const filteredCallData = useMemo(() => {
    if (!searchQuery.trim()) return callData
    const query = searchQuery.toLowerCase()
    return callData.filter(call => 
      call.caller_name.toLowerCase().includes(query) ||
      call.phone.includes(query) ||
      call.transcript?.toLowerCase().includes(query) ||
      call.summary?.toLowerCase().includes(query)
    )
  }, [callData, searchQuery])

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <PhoneCall className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Real Estate Call Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">AI-powered outbound call analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search calls, names, transcripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-80 bg-white/50 border-gray-200/50 focus:bg-white/80 focus:border-violet-200 transition-all duration-200"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-white/50 border-gray-200/50 hover:bg-white/80 hover:border-violet-200 transition-all duration-200"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {/* Loading State */}
        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 animate-pulse"></div>
                <RefreshCw className="absolute inset-0 m-auto h-8 w-8 text-white animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Loading dashboard data...</p>
                <p className="text-sm text-gray-500 mt-1">Fetching your call analytics</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshData} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <ErrorBoundary fallback={
            <div className="p-8 bg-red-50/50 border border-red-200/50 rounded-2xl backdrop-blur-sm">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-red-800 font-semibold text-lg mb-2">Dashboard Error</h3>
                <p className="text-red-700 text-sm">
                  Something went wrong. Please refresh the page or try again later.
                </p>
              </div>
            </div>
          }>
            {/* Enhanced KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Calls</CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                    <PhoneCall className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.totalCalls}</div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    AI-powered outbound calls
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Duration</CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.avgCallDuration}</div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Per call conversation time
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-lime-500/10"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-700">Success Rate</CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.successRate}</div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Successful conversations
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-700">Interested Leads</CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.interestedLeads}</div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Showing genuine interest
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Tabs Section */}
            <div className="mt-8">
              <Tabs defaultValue="recent-calls" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-2">
                  <TabsTrigger 
                    value="recent-calls" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Recent Calls
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leads" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Leads
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent-calls" className="border-none p-0 pt-8">
                  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-b border-gray-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                            <PhoneCall className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              Recent Calls
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {searchQuery ? `${filteredCallData.length} of ${callData.length} calls` : `${callData.length} total calls`}
                            </p>
                          </div>
                        </div>
                        {searchQuery && (
                          <div className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                            Filtered
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <RecentCallsTable callData={filteredCallData} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="leads" className="border-none p-0 pt-8">
                  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-lime-500/10 border-b border-gray-100/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Lead Database
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {leadsData.length} available leads
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <LeadsTable leadsData={leadsData} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analytics" className="border-none p-0 pt-8">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-b border-gray-100/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                            <LineChart className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              Calls Per Day
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Last 14 days activity
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CallsPerDayChart callData={callData} />
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border-b border-gray-100/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                            <PieChart className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              Call Duration
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Duration breakdown
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CallDurationChart callData={callData} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            </ErrorBoundary>
          )}
      </div>
    </div>
  )
}
