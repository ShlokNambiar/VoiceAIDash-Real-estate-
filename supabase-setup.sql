-- SQL script to create the calls table for Supabase
-- Run this directly in your Supabase SQL editor or psql

-- Create the calls table with all required fields for the real estate dashboard
CREATE TABLE IF NOT EXISTS calls (
    id VARCHAR(255) PRIMARY KEY,
    caller_name TEXT NOT NULL DEFAULT 'Unknown Caller',
    phone TEXT DEFAULT '',
    call_start TIMESTAMP WITH TIME ZONE NOT NULL,
    call_end TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    transcript TEXT NOT NULL DEFAULT '',
    summary TEXT DEFAULT '',
    success_flag BOOLEAN NOT NULL DEFAULT false,
    cost DECIMAL(10, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Real Estate specific fields
    client_status VARCHAR(50) DEFAULT 'unknown',
    property_interest TEXT,
    lead_quality VARCHAR(20) DEFAULT 'cold',
    follow_up_date TIMESTAMP WITH TIME ZONE,
    agent_notes TEXT,
    ultravox_call_id VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_client_status ON calls(client_status);
CREATE INDEX IF NOT EXISTS idx_calls_lead_quality ON calls(lead_quality);
CREATE INDEX IF NOT EXISTS idx_calls_success_flag ON calls(success_flag);
CREATE INDEX IF NOT EXISTS idx_calls_call_start ON calls(call_start);

-- Insert a test record to verify everything works
INSERT INTO calls (
    id, caller_name, phone, call_start, call_end, duration, 
    transcript, summary, success_flag, cost, client_status, 
    property_interest, lead_quality, agent_notes
) VALUES (
    'test_setup_' || extract(epoch from now()),
    'John Doe (Setup Test)',
    '+1234567890',
    NOW() - INTERVAL '5 minutes',
    NOW(),
    300,
    'Test transcript: Customer very interested in 2 BHK apartments in Prestige Mira Road. Discussed pricing and amenities.',
    'Customer John expressed high interest in Prestige Mira Road 2 BHK units. Discussed pricing of Rs 1.59 Crore onwards. Customer wants to schedule a site visit next weekend.',
    true,
    2.50,
    'interested',
    'Prestige Mira Road - 2 BHK',
    'hot',
    'Setup test call - customer wants site visit next weekend'
);

-- Verify the table was created correctly
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'calls' 
ORDER BY ordinal_position;

-- Check the test record
SELECT 
    id, 
    caller_name, 
    client_status, 
    lead_quality, 
    property_interest,
    created_at
FROM calls 
WHERE id LIKE 'test_setup_%'
ORDER BY created_at DESC 
LIMIT 1;

-- Show total record count
SELECT COUNT(*) as total_calls FROM calls;