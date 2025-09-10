const fetch = require('node-fetch');

async function simpleTest() {
  try {
    console.log('Testing simple webhook call...');
    
    const testData = {
      "event": "call.ended",
      "call": {
        "callId": "simple_test_" + Date.now(),
        "created": new Date(Date.now() - 120000).toISOString(),
        "ended": new Date().toISOString(),
        "endReason": "completed",
        "billedDuration": "120s",
        "transcript": "Hello, I'm interested in the Prestige Mira Road project. Can you tell me about the 2 BHK pricing?",
        "summary": "Customer inquired about Prestige Mira Road 2 BHK pricing.",
        "systemPrompt": "You are a real estate assistant for Prestige Group."
      }
    };
    
    const response = await fetch('http://localhost:3003/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', text);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const json = JSON.parse(text);
      console.log('JSON response:', json);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

setTimeout(simpleTest, 5000); // Wait 5 seconds for server to be ready