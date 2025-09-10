import { NextResponse, NextRequest } from 'next/server';
import { getAllLeads } from '@/lib/webhook-service';

// Helper function to generate unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Helper function to log request details
function logRequest(request: NextRequest, requestId: string) {
  console.log(`\n--- [${new Date().toISOString()}] Leads Request ${requestId} ---`);
  console.log('🌐 Method:', request.method);
  console.log('🔗 URL:', request.url);
}

// GET /api/leads - Get all leads data
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  logRequest(request, requestId);
  
  try {
    console.log(`🔍 [${requestId}] Fetching all leads...`);
    const startTime = Date.now();
    
    try {
      const leads = await getAllLeads();
      console.log(`✅ [${requestId}] Successfully retrieved ${leads.length} leads in ${Date.now() - startTime}ms`);
      
      return NextResponse.json({
        requestId,
        success: true,
        count: leads.length,
        data: leads,
        timestamp: new Date().toISOString()
      });
      
    } catch (dbError) {
      console.error(`❌ [${requestId}] Database error:`, dbError);
      // Return empty array if there's a database error
      return NextResponse.json({
        requestId,
        success: false,
        count: 0,
        data: [],
        error: 'Failed to fetch leads',
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ [${requestId}] Error in GET handler:`, error);
    
    // Return empty data array instead of error to prevent dashboard from breaking
    return NextResponse.json({
      requestId,
      success: false,
      count: 0,
      data: [],
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Still return 200 to prevent frontend errors
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}