const fetch = require('node-fetch');

async function testLeadsAPI() {
  try {
    console.log('🔍 Testing Leads API...');
    
    const response = await fetch('http://localhost:3003/api/leads', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Leads API Response:');
      console.log('  - Success:', data.success);
      console.log('  - Count:', data.count);
      console.log('  - Sample leads:', data.data?.slice(0, 3)); // Show first 3 leads
      
      if (data.count > 0) {
        console.log(`🎉 Great! Found ${data.count} leads in your database!`);
      } else {
        console.log('⚠️  No leads found in the database');
      }
    } else {
      const text = await response.text();
      console.log('❌ Error response:', text);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Wait a bit for server to be ready then test
setTimeout(testLeadsAPI, 8000);