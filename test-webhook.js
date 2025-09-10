// Test script to send sample Ultravox webhook data to our endpoint
const fs = require('fs');

// Sample Ultravox webhook data with new format
const sampleUltravoxData = {
  "event": "call.ended",
  "call": {
    "callId": "ultravox_test_" + Date.now(),
    "created": new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
    "ended": new Date().toISOString(),
    "endReason": "completed",
    "billedDuration": "240s",
    "transcript": "Hello, I'm calling about the Prestige Mira Road project. I'm very interested in the 2 BHK apartments. What's the pricing? The agent explained that the 2 BHK units start from Rs 1.59 Crore onwards with modern amenities. I'd like to schedule a site visit this weekend. Yes, please book me for Saturday morning. Thank you!",
    "summary": "Customer Rahul expressed high interest in Prestige Mira Road 2 BHK units. Discussed pricing of Rs 1.59 Crore onwards. Customer requested site visit scheduled for Saturday morning.",
    "systemPrompt": "You are an AI real estate assistant for Prestige Group, specifically regarding their new project called Prestige Mira Road. Help customers with information about 2 BHK and 3 BHK apartments, pricing, amenities, and scheduling site visits."
  }
};

// Another sample call
const sampleUltravoxData2 = {
  "event": "call.ended", 
  "call": {
    "callId": "ultravox_test_" + (Date.now() + 1),
    "created": new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
    "ended": new Date().toISOString(),
    "endReason": "unjoined",
    "billedDuration": "0s",
    "transcript": "",
    "summary": "Call not answered by prospect.",
    "systemPrompt": "You are an AI real estate assistant for Kalpataru Group, specifically regarding their new project called Kalpataru Srishti. Help customers with information about premium apartments, pricing, and amenities."
  }
};

// Third sample - interested but needs callback
const sampleUltravoxData3 = {
  "event": "call.ended",
  "call": {
    "callId": "ultravox_test_" + (Date.now() + 2),
    "created": new Date(Date.now() - 300000).toISOString(), // 5 minutes ago  
    "ended": new Date().toISOString(),
    "endReason": "completed",
    "billedDuration": "300s",
    "transcript": "Hi, I got your call about Kalpataru Srishti. I'm currently in a meeting but I'm definitely interested in knowing more about the project. Can someone call me back tomorrow evening around 6 PM? I'm particularly interested in 3 BHK apartments with a good view. My budget is around 2.5 crores. Thank you.",
    "summary": "Customer Priya is interested in Kalpataru Srishti 3 BHK apartments with budget of Rs 2.5 crores. Requested callback tomorrow evening at 6 PM due to current meeting.",
    "systemPrompt": "You are an AI real estate assistant for Kalpataru Group, specifically regarding their new project called Kalpataru Srishti. Help customers with information about premium apartments, pricing, and amenities."
  }
};

async function sendTestData() {
  const webhookUrl = 'http://localhost:3003/api/webhook';
  
  console.log('🚀 Testing Ultravox webhook with new format...\n');
  
  const samples = [sampleUltravoxData, sampleUltravoxData2, sampleUltravoxData3];
  
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    console.log(`📞 Sending test call ${i + 1}...`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sample)
      });
      
      const result = await response.json();
      console.log(`✅ Response ${i + 1}:`, {
        status: response.status,
        success: result.success,
        processed: result.processed,
        callId: sample.call.callId
      });
      
      if (!result.success) {
        console.log('❌ Error details:', result.errors || result.error);
      }
      
    } catch (error) {
      console.error(`❌ Error sending test call ${i + 1}:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Test completed! Check your dashboard at http://localhost:3001');
  console.log('💡 The dashboard should now show 3 test calls with transcripts prominently displayed');
}

// Node.js polyfill for fetch
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

sendTestData().catch(console.error);