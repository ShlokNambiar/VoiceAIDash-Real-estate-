-- Sample leads data for testing the Leads tab in the dashboard
-- Run this in your Supabase SQL editor

-- First create the leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    property_interest TEXT,
    budget DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'new',
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    assigned_agent TEXT
);

-- Insert sample leads data
INSERT INTO leads (id, name, email, phone, property_interest, budget, status, source, notes, assigned_agent) VALUES
('lead_001', 'Rahul Sharma', 'rahul.sharma@email.com', '+91-9876543210', 'Prestige Mira Road - 2 BHK', 15900000, 'qualified', 'Website', 'Very interested in 2 BHK with sea view. Visited site last weekend.', 'Agent Smith'),
('lead_002', 'Priya Patel', 'priya.patel@gmail.com', '+91-9876543211', 'Kalpataru Srishti - 3 BHK', 25000000, 'contacted', 'Phone Call', 'Looking for 3 BHK with good amenities. Budget flexible.', 'Agent Johnson'),
('lead_003', 'Amit Singh', 'amit.singh@yahoo.com', '+91-9876543212', 'Prestige Mira Road - 1 BHK', 12500000, 'new', 'Social Media', 'First-time buyer, needs guidance on loan process.', 'Agent Williams'),
('lead_004', 'Neha Gupta', 'neha.gupta@hotmail.com', '+91-9876543213', 'Kalpataru Srishti - 2 BHK', 18000000, 'converted', 'Referral', 'Purchased 2 BHK apartment. Very satisfied with the service.', 'Agent Brown'),
('lead_005', 'Vikram Reddy', 'vikram.reddy@gmail.com', '+91-9876543214', 'Prestige Mira Road - 3 BHK', 28000000, 'qualified', 'Walk-in', 'Looking for premium 3 BHK with all modern amenities.', 'Agent Davis'),
('lead_006', 'Anita Joshi', 'anita.joshi@email.com', '+91-9876543215', 'Kalpataru Srishti - 1 BHK', 11000000, 'lost', 'Website', 'Decided to go with another project due to location preference.', 'Agent Miller'),
('lead_007', 'Ravi Kumar', 'ravi.kumar@gmail.com', '+91-9876543216', 'Prestige Mira Road - 2 BHK', 16500000, 'contacted', 'Phone Call', 'Interested in higher floor units. Wants to visit this weekend.', 'Agent Wilson'),
('lead_008', 'Sunita Agarwal', 'sunita.agarwal@yahoo.com', '+91-9876543217', 'Kalpataru Srishti - 3 BHK', 24500000, 'new', 'Email Campaign', 'Just started looking for properties. Needs detailed information.', 'Agent Taylor'),
('lead_009', 'Manoj Verma', 'manoj.verma@hotmail.com', '+91-9876543218', 'Prestige Mira Road - 1 BHK', 13200000, 'qualified', 'Referral', 'Ready to book if price negotiation is possible.', 'Agent Anderson'),
('lead_010', 'Kavita Sharma', 'kavita.sharma@gmail.com', '+91-9876543219', 'Kalpataru Srishti - 2 BHK', 19500000, 'contacted', 'Walk-in', 'Comparing with other projects. Wants detailed comparison chart.', 'Agent Thomas');

-- Update the timestamp for some variety
UPDATE leads SET created_at = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE id IN ('lead_001', 'lead_002');
UPDATE leads SET created_at = CURRENT_TIMESTAMP - INTERVAL '2 days' WHERE id IN ('lead_003', 'lead_004');
UPDATE leads SET created_at = CURRENT_TIMESTAMP - INTERVAL '3 days' WHERE id IN ('lead_005', 'lead_006');
UPDATE leads SET created_at = CURRENT_TIMESTAMP - INTERVAL '7 days' WHERE id IN ('lead_007', 'lead_008');
UPDATE leads SET created_at = CURRENT_TIMESTAMP - INTERVAL '10 days' WHERE id IN ('lead_009', 'lead_010');

-- Check the inserted data
SELECT 
    id,
    name,
    status,
    property_interest,
    budget,
    source,
    assigned_agent,
    created_at
FROM leads 
ORDER BY created_at DESC;