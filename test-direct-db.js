// Test direct database connection
const { sql } = require('@vercel/postgres');

async function testDirectDB() {
  console.log('🔍 Testing direct database connection...');
  
  try {
    console.log('Environment variables:');
    console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Test the connection
    console.log('\n📡 Testing database connection...');
    const result = await sql`SELECT COUNT(*) as count FROM public."Leads"`;
    
    console.log('✅ Connection successful!');
    console.log('Total leads in database:', result.rows[0].count);
    
    // Get a few sample records
    console.log('\n📋 Fetching sample records...');
    const sampleResult = await sql`
      SELECT "Owner Name", "Mobile No" 
      FROM public."Leads" 
      LIMIT 5
    `;
    
    console.log('Sample records:');
    sampleResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Owner: ${row["Owner Name"]}, Mobile: ${row["Mobile No"]}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testDirectDB();