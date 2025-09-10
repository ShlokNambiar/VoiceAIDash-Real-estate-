const fetch = require('node-fetch');

async function testLeads() {
  console.log('🔍 Testing Leads API endpoint...');
  
  try {
    console.log('Making request to http://localhost:3003/api/leads');
    
    const response = await fetch('http://localhost:3003/api/leads', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw response:', text.substring(0, 500));
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        console.log('✅ JSON Response:');
        console.log('  Success:', data.success);
        console.log('  Count:', data.count);
        console.log('  Has data:', Array.isArray(data.data));
        if (data.data && data.data.length > 0) {
          console.log('  First record:', data.data[0]);
        }
        if (data.error) {
          console.log('  Error:', data.error);
        }
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('❌ Non-JSON response received');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testLeads();