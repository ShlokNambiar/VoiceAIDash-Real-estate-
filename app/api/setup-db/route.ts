import { sql } from '@vercel/postgres';

// Test database connection and create tables
async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  try {
    // Check if database connection is available
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      throw new Error('No database connection URL found in environment variables');
    }

    console.log('✅ Database connection available');

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
        client_status VARCHAR(50) DEFAULT 'unknown',
        property_interest TEXT,
        lead_quality VARCHAR(20) DEFAULT 'cold',
        follow_up_date TIMESTAMP WITH TIME ZONE,
        agent_notes TEXT,
        ultravox_call_id VARCHAR(255)
      )
    `;
    console.log('✅ Calls table created successfully');

    // Create indexes for better query performance
    console.log('🔍 Creating database indexes...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_calls_client_status ON calls(client_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_calls_lead_quality ON calls(lead_quality)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_calls_success_flag ON calls(success_flag)`;
    
    console.log('✅ Database indexes created successfully');

    // Insert a test record
    console.log('🧪 Inserting test call record...');
    const testCallId = `test_setup_${Date.now()}`;
    const testResult = await sql`
      INSERT INTO calls (
        id, caller_name, phone, call_start, call_end, duration, 
        transcript, summary, success_flag, cost, client_status, 
        property_interest, lead_quality, agent_notes
      ) VALUES (
        ${testCallId},
        ${'John Doe (Setup Test)'},
        ${'+1234567890'},
        ${new Date(Date.now() - 300000)},
        ${new Date()},
        ${300},
        ${'Test transcript: Customer very interested in 2 BHK apartments in Prestige Mira Road.'},
        ${'Customer John expressed high interest in Prestige Mira Road 2 BHK units. Discussed pricing of Rs 1.59 Crore onwards. Requested site visit next weekend.'},
        ${true},
        ${2.50},
        ${'interested'},
        ${'Prestige Mira Road - 2 BHK'},
        ${'hot'},
        ${'Setup test call - customer wants site visit next weekend'}
      )
      RETURNING id, caller_name, client_status, lead_quality
    `;

    console.log('✅ Test record inserted:', testResult.rows[0]);

    // Get table structure for verification
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'calls' 
      ORDER BY ordinal_position
    `;

    console.log('📊 Table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Get total record count
    const countResult = await sql`SELECT COUNT(*) as total FROM calls`;
    console.log(`📈 Total calls in database: ${countResult.rows[0].total}`);

    return {
      success: true,
      message: 'Database setup completed successfully',
      testRecord: testResult.rows[0],
      tableColumns: tableInfo.rows.length,
      totalRecords: countResult.rows[0].total
    };

  } catch (error) {
    console.error('❌ Database setup error:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

export async function GET() {
  const result = await setupDatabase();
  
  return Response.json(result, {
    status: result.success ? 200 : 500
  });
}