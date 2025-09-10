# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Real Estate Call Dashboard** built with Next.js 15 that tracks outbound AI calls made by Ultravox AI for real estate leads. The dashboard visualizes call analytics, manages lead data, and integrates with Vercel Postgres for data storage.

**Key Features:**
- Real-time call analytics and KPI tracking
- Ultravox AI webhook integration for call data ingestion
- Lead management with Supabase/Postgres integration
- Interactive dashboard with charts and tables
- Client interest level tracking and property analysis

## Development Commands

### Core Development
```bash
# Install dependencies (required for legacy peer deps)
npm install --legacy-peer-deps

# Start development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing & Debugging
```bash
# Test webhook endpoint locally (requires dev server running)
node test-webhook.js

# Test database connection directly
node debug-db-direct.js

# Test deployed webhook (update URL in script)
node test-deployed-webhook.js

# Debug leads API
node debug-leads.js

# Simple database test
node simple-test.js
```

### Database Operations
```bash
# Setup Supabase tables (run once)
node setup-supabase-tables.js

# Initialize database schema
# Hit GET /api/setup-db in browser or:
curl http://localhost:3000/api/setup-db

# Test database connectivity
# Hit GET /api/test-db in browser or:
curl http://localhost:3000/api/test-db
```

## Architecture Overview

### Data Flow Architecture
1. **Ultravox AI** makes outbound calls → generates call data
2. **Webhook Integration** receives POST requests at `/api/webhook` 
3. **Data Processing Layer** transforms and validates incoming data
4. **Database Layer** stores call records in Vercel Postgres
5. **Frontend Dashboard** displays real-time analytics and tables

### Core Components Structure

**Backend Services:**
- `lib/webhook-service.ts` - Central data processing logic, handles Ultravox webhook format transformation, calculates metrics
- `lib/db.ts` - Database initialization, schema management, column migrations
- `app/api/webhook/route.ts` - Main webhook endpoint handling POST/GET requests with comprehensive logging
- `app/api/leads/route.ts` - Leads data API endpoint
- `app/api/setup-db/route.ts` - Database setup endpoint

**Frontend Components:**
- `components/dashboard-fixed.tsx` - Main dashboard orchestrator with data fetching logic
- `components/recent-calls-table.tsx` - Call records table with transcript dialogs
- `components/leads-table.tsx` - Lead management interface
- `components/calls-per-day-chart.tsx` & `components/call-duration-chart.tsx` - Analytics visualizations
- `components/error-boundary.tsx` - Error handling wrapper

### Key Data Transformations

The system handles multiple webhook formats:

**Ultravox AI Format (Primary):**
```json
{
  "event": "call.ended",
  "call": {
    "callId": "uuid",
    "created": "ISO_DATE",
    "ended": "ISO_DATE", 
    "transcript": "full_conversation",
    "summary": "call_summary",
    "endReason": "completed|unjoined|timeout",
    "billedDuration": "240s",
    "systemPrompt": "agent_instructions"
  }
}
```

**Legacy/Make.com Format (Supported):**
```json
{
  "id": "call_id",
  "caller_name": "Client Name",
  "phone": "+91XXXXXXXXXX",
  "call_start": "ISO_DATE",
  "call_end": "ISO_DATE", 
  "transcript": "conversation",
  "success_flag": true,
  "cost": 125.50
}
```

### Database Schema

**Primary Table: `calls`**
- Core fields: `id`, `caller_name`, `phone`, `call_start`, `call_end`, `duration`, `cost`
- Content fields: `transcript`, `summary`, `success_flag` 
- Real Estate fields: `client_status`, `property_interest`, `lead_quality`, `follow_up_date`, `agent_notes`
- Metadata: `ultravox_call_id`, `created_at`, `updated_at`

**External Table: `Leads`** (Supabase)
- Fields: `"Owner Name"`, `"Mobile No"`

## Development Workflow

### Adding New Features
1. **Database Changes**: Update schema in `lib/db.ts`, add migration logic
2. **Data Processing**: Modify `lib/webhook-service.ts` for new field handling
3. **API Updates**: Update relevant route handlers in `app/api/`
4. **Frontend Integration**: Update components and TypeScript interfaces

### Testing Webhook Integration
1. Start dev server: `npm run dev`
2. Run test script: `node test-webhook.js` (sends 3 sample Ultravox calls)
3. Verify data appears in dashboard at http://localhost:3000
4. Check browser console and terminal logs for processing details

### Debugging Common Issues
- **Database Connection**: Check environment variables `POSTGRES_URL` or `DATABASE_URL`
- **Webhook Processing**: Review detailed logs in terminal when processing requests
- **Data Transformation**: Webhook service logs each processing step with request IDs
- **Frontend Errors**: Error boundary component catches React errors gracefully

## Environment Configuration

### Required Environment Variables
```bash
# Database (Vercel Postgres)
POSTGRES_URL=postgres://...
# OR
DATABASE_URL=postgres://...
```

### Development vs Production
- **Development**: Uses `http://localhost:3000/api/webhook` for testing
- **Production**: Webhook URL becomes `https://your-app.vercel.app/api/webhook`
- **CORS**: Configured in `vercel.json` to accept webhook requests from external sources

## Real Estate Business Logic

### Lead Classification System
- **Hot Leads**: Expressions of high interest, ready to buy, appointment scheduled
- **Warm Leads**: General interest, thinking about it, callback requested  
- **Cold Leads**: Basic information gathering, no immediate interest
- **Unqualified**: Not interested, wrong number, no answer

### KPI Calculations
- **Interested Leads**: Based on transcript analysis for interest keywords
- **Success Rate**: Percentage of calls with `success_flag: true`
- **Average Call Cost**: Calculated at ₹0.50 per minute when not provided
- **Client Status**: Auto-determined from call content and end reason

### Property Interest Extraction
- System extracts project names from `systemPrompt` field
- Common projects: "Kalpataru Srishti", "Prestige Mira Road", "Prestige Group"
- Stored in `property_interest` field for filtering and analysis

## Deployment Notes

The application is optimized for **Vercel deployment** with:
- Function timeout configured to 10 seconds for webhook processing
- CORS headers pre-configured for external webhook access
- Vercel Postgres integration with automatic connection handling
- Build configuration that ignores TypeScript/ESLint errors in production builds
