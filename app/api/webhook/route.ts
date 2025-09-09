import { NextResponse, NextRequest } from 'next/server';
import { CallData, saveCallData, getAllCalls } from '@/lib/webhook-service';

// Initialize database only when needed, not on import
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized && (process.env.POSTGRES_URL || process.env.DATABASE_URL)) {
    try {
      const { initDB } = await import('@/lib/db');
      await initDB();
      dbInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      // Don't throw error to prevent build failures
    }
  }
}

// Helper function to generate unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Helper function to log request details
function logRequest(request: NextRequest, requestId: string) {
  console.log(`\n--- [${new Date().toISOString()}] Webhook Request ${requestId} ---`);
  console.log('🌐 Method:', request.method);
  console.log('🔗 URL:', request.url);
  
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log('📋 Headers:', JSON.stringify(headers, null, 2));
}

// Helper function to create error response
function createErrorResponse(error: string, status: number, requestId: string, details?: any) {
  console.error(`❌ [${requestId}] ${error}`, details || '');
  return NextResponse.json(
    { 
      requestId,
      error,
      details: details?.message || details || 'No additional details',
      timestamp: new Date().toISOString()
    },
    { status, statusText: error }
  );
}

// POST /api/webhook - Receive webhook data from Ultravox AI
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  logRequest(request, requestId);
  
  // Ensure database is initialized
  await ensureDbInitialized();
  
  // Log request start
  const startTime = Date.now();
  console.log(`🔄 [${requestId}] Processing webhook request...`);
  
  try {
    // Get raw request body for logging and validation
    let requestBody: string;
    try {
      requestBody = await request.text();
      console.log(`📥 [${requestId}] Request body length: ${requestBody.length} bytes`);
      
      if (!requestBody || requestBody.trim() === '') {
        return createErrorResponse('Empty request body', 400, requestId);
      }
    } catch (error) {
      return createErrorResponse('Failed to read request body', 400, requestId, error);
    }
    
    // Parse JSON
    let data: any;
    try {
      data = JSON.parse(requestBody);
      console.log(`📝 [${requestId}] Successfully parsed JSON data`);
    } catch (parseError) {
      return createErrorResponse('Invalid JSON payload', 400, requestId, parseError);
    }

    // Process the data array or single object
    const newData = Array.isArray(data) ? data : [data];
    console.log(`🔄 [${requestId}] Processing ${newData.length} call(s)`);
    
    if (newData.length === 0) {
      return createErrorResponse('No call data provided', 400, requestId);
    }
    
    let savedCount = 0;
    const saveErrors: Array<{id?: string, error: string, details?: string}> = [];
    const processedCalls: any[] = [];
    
    // Get existing calls to check for duplicates
    let existingCalls: CallData[] = [];
    try {
      existingCalls = await getAllCalls();
      console.log(`🔍 [${requestId}] Retrieved ${existingCalls.length} existing calls for duplicate check`);
    } catch (error) {
      console.error(`❌ [${requestId}] Error fetching existing calls:`, error);
    }

    for (const item of newData) {
      console.log(`📥 [${requestId}] Processing call data item:`, JSON.stringify(item, null, 2));
      
      // Handle new Ultravox webhook format
      let processedItem: any = {};
      
      // Check if this is the new Ultravox format with 'call' object
      if (item.event === 'call.ended' && item.call) {
        console.log(`🔄 [${requestId}] Detected new Ultravox format`);
        const call = item.call;
        
        processedItem = {
          id: call.callId || call.id,
          callId: call.callId,
          caller_name: 'Unknown Caller', // Will be extracted from transcript/summary
          phone: '', // Not provided in this format
          call_start: call.created,
          call_end: call.ended,
          duration: 0, // Will be calculated
          transcript: call.transcript || '',
          summary: call.summary || call.shortSummary || '',
          success_flag: call.endReason !== 'unjoined' && call.endReason !== 'timeout',
          cost: 0, // Will be calculated based on billedDuration
          endReason: call.endReason,
          billedDuration: call.billedDuration,
          systemPrompt: call.systemPrompt
        };
        
        console.log(`✅ [${requestId}] Transformed Ultravox format to:`, processedItem);
      } else {
        // Handle existing format
        processedItem = item;
      }
      
      // Generate a unique call ID if not provided or if it's a duplicate
      const generateNewCallId = (): string => `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      let callId = processedItem.id || processedItem.callId || processedItem.ID?.toString() || generateNewCallId();
      
      // If this is a duplicate of an existing call but with different data, generate a new ID
      const isDuplicate = existingCalls.some((existingCall: CallData) => {
        return existingCall.id === callId && 
               existingCall.caller_name !== (item.caller_name || item['Caller Name']);
      });
      
      if (isDuplicate) {
        const oldId = callId;
        callId = generateNewCallId();
        console.log(`🔄 [${requestId}] Duplicate call ID detected (${oldId}), using new ID: ${callId}`);
      }
      console.log(`🆔 [${requestId}] Using call ID: ${callId}`);
      
      try {
        // Parse and validate timestamps
        let callStart: Date;
        let callEnd: Date;
        let duration: number;
        
        try {
          const startTime = processedItem.call_start || processedItem['Call Start'] || processedItem.created || new Date().toISOString();
          const endTime = processedItem.call_end || processedItem['Call End'] || processedItem.ended || new Date().toISOString();
          
          console.log(`⏱️ [${requestId}] Parsing timestamps:`, { startTime, endTime });
          
          callStart = new Date(startTime);
          callEnd = new Date(endTime);
          
          if (isNaN(callStart.getTime()) || isNaN(callEnd.getTime())) {
            console.error(`❌ [${requestId}] Invalid date format for call ${callId}`, {
              call_start: processedItem.call_start,
              call_end: processedItem.call_end,
              created: processedItem.created,
              ended: processedItem.ended
            });
            throw new Error('Invalid date format');
          }
          
          duration = Math.max(0, Math.floor((callEnd.getTime() - callStart.getTime()) / 1000));
          
          // Override duration if billedDuration is provided (from Ultravox)
          if (processedItem.billedDuration) {
            const billedMatch = processedItem.billedDuration.match(/(\d+)s/);
            if (billedMatch) {
              duration = parseInt(billedMatch[1]) || duration;
            }
          }
          
          console.log(`⏱️ [${requestId}] Parsed timestamps:`, {
            callStart: callStart.toISOString(),
            callEnd: callEnd.toISOString(),
            duration: `${duration}s`,
            billedDuration: processedItem.billedDuration
          });
          
        } catch (dateError) {
          const errorMsg = `Invalid date format in call data (ID: ${callId})`;
          console.error(`❌ [${requestId}] ${errorMsg}:`, dateError);
          saveErrors.push({ 
            id: callId, 
            error: errorMsg,
            details: `Start: ${item.call_start}, End: ${item.call_end}`
          });
          continue;
        }
        
        // Parse cost with validation and detailed logging
        let cost: number;
        try {
          const rawCost = processedItem.cost ?? processedItem.Cost;
          console.log(`💰 [${requestId}] Parsing cost for call ${callId}:`, { rawCost, type: typeof rawCost });
          
          cost = typeof rawCost === 'number' 
            ? rawCost 
            : typeof rawCost === 'string' 
              ? parseFloat(rawCost) || 0 
              : 0;
          
          // Calculate cost based on duration if not provided (rough estimate: ₹0.50 per minute)
          if (cost === 0 && duration > 0) {
            cost = Math.round((duration / 60) * 0.50 * 100) / 100; // ₹0.50 per minute
          }
          
          if (isNaN(cost) || !isFinite(cost)) {
            console.warn(`⚠️ [${requestId}] Invalid cost value for call ${callId}:`, rawCost);
            cost = 0;
          } else {
            cost = Math.max(0, parseFloat(cost.toFixed(4))); // Ensure non-negative with 4 decimal places
            console.log(`✅ [${requestId}] Parsed cost for call ${callId}:`, cost);
          }
        } catch (costError) {
          console.warn(`⚠️ [${requestId}] Error parsing cost for call ${callId}, defaulting to 0:`, costError);
          cost = 0;
        }

        // Transform the data to match our CallData interface with validation
        const callerName = processedItem.caller_name || processedItem['Caller Name'] || 'Unknown Caller';
        const phone = processedItem.phone || '';
        
        // Map fields correctly - summary comes from Summary/summary field
        const summary = processedItem.summary || processedItem.Summary || '';
        // Transcript should come from transcript field, or be empty if not provided
        const transcript = processedItem.transcript || '';
        
        // Extract caller name from system prompt if available
        let extractedCallerName = callerName;
        if (processedItem.systemPrompt && callerName === 'Unknown Caller') {
          // Try to extract property/project info from system prompt for better identification
          const projectMatch = processedItem.systemPrompt.match(/regarding their new project.*?called\s+([^.]+)/i);
          if (projectMatch) {
            extractedCallerName = `Prospect - ${projectMatch[1].trim()}`;
          } else {
            extractedCallerName = 'Real Estate Prospect';
          }
        }
        
        // Determine client status and lead quality based on success and content
        const determineClientStatus = (): CallData['client_status'] => {
          // Check endReason for Ultravox format
          if (processedItem.endReason) {
            if (processedItem.endReason === 'unjoined' || processedItem.endReason === 'timeout') {
              return 'no_answer';
            }
          }
          
          if (processedItem.success_flag === true) {
            const content = (summary + transcript).toLowerCase();
            if (content.includes('appointment') || content.includes('schedule') || content.includes('visit')) {
              return 'appointment_scheduled';
            } else if (content.includes('interested') || content.includes('like to know')) {
              return 'interested';
            } else if (content.includes('callback') || content.includes('call back')) {
              return 'callback_requested';
            }
          }
          return processedItem.success_flag === false ? 'not_interested' : 'unknown';
        };
        
        const determineLeadQuality = (): CallData['lead_quality'] => {
          const content = (summary + transcript + (processedItem.systemPrompt || '')).toLowerCase();
          if (content.includes('very interested') || content.includes('definitely') || content.includes('ready to buy')) {
            return 'hot';
          } else if (content.includes('interested') || content.includes('maybe') || content.includes('thinking')) {
            return 'warm';
          } else if (content.includes('not interested') || content.includes('no thank') || processedItem.endReason === 'unjoined') {
            return 'unqualified';
          }
          return 'cold';
        };
        
        // Extract property interest from system prompt
        let propertyInterest = processedItem.property_interest || '';
        if (processedItem.systemPrompt && !propertyInterest) {
          const projectMatches = processedItem.systemPrompt.match(/(Kalpataru Srishti|Prestige Mira Road|Prestige Group)/gi);
          if (projectMatches) {
            propertyInterest = projectMatches.join(', ');
          }
        }
        
        const callData: CallData = {
          id: callId,
          caller_name: extractedCallerName.toString().substring(0, 255),
          phone: phone.toString().substring(0, 50),
          call_start: callStart.toISOString(),
          call_end: callEnd.toISOString(),
          duration: duration,
          transcript: transcript.toString().substring(0, 10000),
          summary: summary.toString().substring(0, 10000),
          success_flag: processedItem.success_flag !== undefined 
            ? Boolean(processedItem.success_flag) 
            : (processedItem.Success !== undefined ? Boolean(processedItem.Success) : 
               (processedItem.endReason && processedItem.endReason !== 'unjoined' && processedItem.endReason !== 'timeout')),
          cost: cost,
          // Real Estate specific fields
          client_status: determineClientStatus(),
          property_interest: propertyInterest,
          lead_quality: determineLeadQuality(),
          follow_up_date: processedItem.follow_up_date ? new Date(processedItem.follow_up_date).toISOString() : undefined,
          agent_notes: processedItem.agent_notes || `AI Agent Call - End Reason: ${processedItem.endReason || 'Unknown'}`,
          ultravox_call_id: processedItem.callId || callId
        };
        
        console.log(`📝 [${requestId}] Summary for call ${callId}:`, summary);
        
        console.log(`📋 [${requestId}] Transformed call data for ${callId}:`, {
          ...callData,
          transcript: callData.transcript.length > 50 
            ? callData.transcript.substring(0, 50) + '...' 
            : callData.transcript
        });
        
        // Log processed data (sensitive info redacted)
        console.log(`📊 [${requestId}] Processed call data for ${callId}:`, {
          id: callData.id,
          caller: callData.caller_name,
          duration: `${callData.duration}s`,
          cost: `₹${callData.cost.toFixed(4)}`,
          success: callData.success_flag,
          timestamp: callData.call_start
        });
        
        // Save to database
        console.log(`💾 [${requestId}] Saving call ${callId} to database...`);
        const saved = await saveCallData(callData);
        
        if (saved) {
          console.log(`✅ [${requestId}] Successfully saved call ${callId}`);
          savedCount++;
          processedCalls.push({
            id: callData.id,
            status: 'saved',
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('Save operation returned false');
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        const callId = item?.id || item?.ID?.toString() || 'unknown';
        console.error(`❌ [${requestId}] Error processing call ${callId}:`, errorMsg);
        saveErrors.push({ 
          id: callId, 
          error: `Failed to process call: ${errorMsg}`,
          details: error instanceof Error ? error.stack : undefined
        });
      }
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Prepare response
    const response = {
      requestId,
      success: savedCount > 0 && saveErrors.length === 0,
      processed: {
        total: newData.length,
        saved: savedCount,
        failed: saveErrors.length,
        skipped: newData.length - savedCount - saveErrors.length
      },
      durationMs: processingTime,
      timestamp: new Date().toISOString(),
      ...(saveErrors.length > 0 && { 
        errors: saveErrors,
        errorCount: saveErrors.length,
        errorSummary: `${saveErrors.length} of ${newData.length} calls failed to process`
      })
    };
    
    // Log completion
    const statusEmoji = response.success ? '✅' : saveErrors.length > 0 ? '⚠️' : '❌';
    console.log(`\n${statusEmoji} [${requestId}] Webhook processing completed in ${processingTime}ms`);
    console.log(`   • Total: ${response.processed.total}`);
    console.log(`   • Saved: ${response.processed.saved}`);
    if (response.processed.failed > 0) {
      console.log(`   • Failed: ${response.processed.failed}`);
    }
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : (savedCount > 0 ? 207 : 400) 
    });
    
  } catch (error) {
    const errorId = `err_${Date.now()}`;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`❌ [${requestId}] Critical error processing webhook (${errorId}):`, error);
    
    return createErrorResponse(
      'Internal server error', 
      500, 
      requestId,
      {
        errorId,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    );
  }
}

// GET /api/webhook - Get all call data
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  logRequest(request, requestId);
  
  // Ensure database is initialized
  await ensureDbInitialized();
  
  try {
    console.log(`🔍 [${requestId}] Fetching all call records...`);
    const startTime = Date.now();
    
    try {
      const calls = await getAllCalls();
      console.log(`✅ [${requestId}] Successfully retrieved ${calls.length} call records in ${Date.now() - startTime}ms`);
      
      return NextResponse.json({
        requestId,
        success: true,
        count: calls.length,
        data: calls,
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
        error: 'Failed to fetch calls',
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
