// Direct database test to debug the leads issue
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function debugLeads() {
  console.log('🔍 Debugging Leads Database Connection...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    console.log('❌ No database connection string found!');
    return;
  }
  
  try {
    // Test basic connection
    console.log('\n📡 Testing database connection...');
    
    // First, let's see what tables exist
    console.log('\n📋 Checking available tables...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Available tables:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    // Check if Leads table exists and get its structure
    console.log('\n🔍 Checking Leads table structure...');
    const columnsResult = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Leads' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('Leads table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Count total records
    console.log('\n📊 Checking record count...');
    const countResult = await sql`SELECT COUNT(*) as count FROM public."Leads"`;
    console.log('Total records:', countResult.rows[0].count);
    
    // Get sample data with exact column names
    console.log('\n📋 Fetching sample records...');
    const sampleResult = await sql`
      SELECT * FROM public."Leads" 
      LIMIT 3
    `;
    
    console.log('Sample records:');
    sampleResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}.`, JSON.stringify(row, null, 4));
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  }
}

debugLeads();