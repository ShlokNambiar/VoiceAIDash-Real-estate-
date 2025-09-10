const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function setupSupabaseTables() {
  console.log('🚀 Setting up Supabase database tables...');
  
  try {
    console.log('✅ Using Vercel Postgres client for Supabase connection');

    // Create the calls table with all required fields
    console.log('📋 Creating calls table...');
    await sql`
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
      )
    `;
    console.log('✅ Created calls table successfully');

    // Create indexes for better query performance
    console.log('🔍 Creating database indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at)
    `;
    console.log('✅ Created index on created_at');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_calls_client_status ON calls(client_status)
    `;
    console.log('✅ Created index on client_status');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_calls_lead_quality ON calls(lead_quality)
    `;
    console.log('✅ Created index on lead_quality');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_calls_success_flag ON calls(success_flag)
    `;
    console.log('✅ Created index on success_flag');

    // Check if table was created successfully
    const tableCheck = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'calls' 
      ORDER BY ordinal_position
    `;

    console.log('\n📊 Table structure verification:');
    console.table(tableCheck.rows);

    // Insert a test record to verify everything works
    console.log('\n🧪 Inserting test call record...');
    const testCallId = `test_${Date.now()}`;
    const testResult = await sql`
      INSERT INTO calls (
        id, caller_name, phone, call_start, call_end, duration, 
        transcript, summary, success_flag, cost, client_status, 
        property_interest, lead_quality, agent_notes
      ) VALUES (
        ${testCallId},
        ${'John Doe (Test)'},
        ${'+1234567890'},
        ${new Date(Date.now() - 300000)}, -- 5 minutes ago
        ${new Date()},
        ${300}, -- 5 minutes
        ${'Test call transcript: Customer interested in 2 BHK apartment in Mira Road.'},
        ${'Customer John showed high interest in Prestige Mira Road 2 BHK units. Discussed pricing and location benefits. Requested site visit next weekend.'},
        ${true},
        ${2.50},
        ${'interested'},
        ${'Prestige Mira Road - 2 BHK'},
        ${'hot'},
        ${'Test call from setup script. Customer wants site visit next weekend.'}
      )
      RETURNING id, caller_name, client_status, lead_quality
    `;

    console.log('✅ Test record inserted successfully');
    console.table(testResult.rows);

    // Verify total record count
    const countResult = await sql`SELECT COUNT(*) as total_calls FROM calls`;
    console.log(`\n📊 Total calls in database: ${countResult.rows[0].total_calls}`);

    console.log('\n🎉 Supabase database setup completed successfully!');
    console.log('\n📱 Your dashboard is now ready to receive and display Ultravox AI call data');
    console.log('🔗 Webhook endpoint: POST /api/webhook');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

// Run the setup
setupSupabaseTables()
  .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });