# Real Estate Call Dashboard

A dynamic Next.js dashboard for tracking real estate outbound call analytics with Ultravox AI integration.

## Features

- **Real-time KPI Tracking**: Monitor total outbound calls, interested leads, hot prospects, and call duration
- **Client Status Tracking**: Track client interest levels and lead quality  
- **Interactive Call Transcripts**: View full conversation transcripts from Ultravox AI calls
- **Property Interest Analysis**: Analyze which properties clients are interested in
- **Auto-refresh**: Data updates every 10 seconds automatically
- **Responsive Design**: Works on desktop and mobile devices

## Real Estate KPIs

### Dashboard Metrics
- **Total Outbound Calls**: AI-powered real estate calls made
- **Average Call Duration**: Mean duration across all calls
- **Current Balance**: Budget tracking for call costs
- **Average Call Cost**: Cost per call analysis
- **Interested Leads**: Clients showing interest in properties
- **Hot Prospects**: High-quality leads ready to move forward

### Call Tracking
- **Client Status**: Track interest level (High Interest, Warm Lead, No Interest)
- **Property Interest**: Which specific properties clients are interested in
- **Full Transcripts**: Complete conversation records from Ultravox AI

## Ultravox AI Integration

### Webhook Configuration
This dashboard is designed to receive data from Ultravox AI webhooks. Configure your Ultravox webhook to send data to:

```
POST /api/webhook
```

### Supported Webhook Events
- `call.started` - When a call begins
- `call.ended` - When a call ends (primary event for dashboard)
- `call.joined` - When a call is joined

### Expected Data Format from Ultravox

The webhook receives data in this format:
```json
{
  "event": "call.ended",
  "call": {
    "callId": "uuid",
    "shortSummary": "Brief call summary",
    "summary": "Detailed conversation transcript",
    "created": "2024-01-01T10:00:00Z",
    "joined": "2024-01-01T10:00:00Z", 
    "ended": "2024-01-01T10:02:30Z",
    "metadata": {
      "client_phone": "+1234567890",
      "client_name": "John Doe",
      "property_interest": "Downtown Condo"
    }
  }
}
```

### Expected Data Format

The webhook should return a JSON array. The dashboard supports both flat and nested structures:

**Option 1: Flat Structure**
```json
[
  {
    "id": "call_001",
    "caller_name": "John Doe",
    "phone": "+91 98765 43210",
    "call_start": "2024-01-01T10:00:00Z",
    "call_end": "2024-01-01T10:02:30Z",
    "transcript": "I would like to book a table...",
    "success_flag": true,
    "cost": 125.50
  }
]
```

**Option 2: Make.com Nested Structure**
```json
[
  {
    "id": "call_001",
    "phone": "+91 98765 43210",
    "message": {
      "startedAt": "2024-01-01T10:00:00Z",
      "endedAt": "2024-01-01T10:02:30Z",
      "summary": "I would like to book a table...",
      "cost": 125.50,
      "analysis": {
        "structuredData": {
          "name": "John Doe"
        },
        "successEvaluation": true
      }
    }
  }
]
```

### Field Mapping
- **caller_name**: `message.analysis.structuredData.name` or `caller_name`
- **phone**: `phone` (direct field)
- **call_start**: `message.startedAt` or `call_start`
- **call_end**: `message.endedAt` or `call_end`
- **transcript**: `message.summary` or `transcript`
- **cost**: `message.cost` or `cost`
- **success_flag**: `message.analysis.successEvaluation` or `success_flag`

## KPI Calculations

- **Total Outbound Calls**: Count of all AI-powered real estate calls
- **Average Call Duration**: Mean duration across all calls
- **Current Balance**: Budget tracking from initial amount minus total costs
- **Average Call Cost**: Total cost divided by number of calls
- **Interested Leads**: Clients showing interest in properties (based on transcript analysis)
- **Hot Prospects**: High-quality leads ready for appointments or follow-up

## Getting Started

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture

- **Frontend**: Next.js 15 with React 19
- **UI Components**: shadcn/ui with Radix UI primitives
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with custom gradients
- **Data Fetching**: Custom webhook service with caching
- **TypeScript**: Full type safety throughout

## File Structure

```
├── app/
│   ├── api/test-webhook/route.ts    # Test data endpoint
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main page
├── components/
│   ├── dashboard.tsx                # Main dashboard component
│   ├── recent-calls-table.tsx       # Calls table
│   ├── calls-per-day-chart.tsx      # Line chart
│   ├── call-duration-chart.tsx      # Pie chart
│   └── ui/                          # UI components
├── lib/
│   ├── webhook-service.ts           # Data fetching logic
│   └── utils.ts                     # Utilities
```

## Customization

### Webhook URL
Update the `WEBHOOK_URL` constant in `lib/webhook-service.ts`:

```typescript
const WEBHOOK_URL = "your-webhook-url-here"
```

### Initial Balance
Modify the `INITIAL_BALANCE` constant:

```typescript
const INITIAL_BALANCE = 5000 // Change to your desired amount
```

### Refresh Interval
Adjust auto-refresh timing in `components/dashboard.tsx`:

```typescript
const interval = setInterval(refreshData, 2 * 60 * 1000) // 2 minutes
```

## Error Handling

- Clear error messages if webhook fails
- 30-second caching to reduce API calls
- Loading states and error indicators
- Empty states when no data is available
- Retry mechanism on refresh button

## Performance

- Client-side caching prevents excessive API calls
- Optimized re-renders with React hooks
- Responsive design with minimal bundle size
- Progressive loading with skeleton states
