// Test script to send sample call data to the webhook
const testCallData = {
  "event": "call.ended",
  "call": {
    "callId": "test-call-001",
    "created": new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    "ended": new Date().toISOString(),
    "endReason": "agent_hangup",
    "billedDuration": "120s",
    "systemPrompt": "You are Rekha, an outbound AI sales agent calling on behalf of Prestige Group regarding their new project launch in Mira Road.",
    "summary": "Hi, this is Rekha from Prestige Group. I called to share details about our new project in Mira Road called Prestige. The customer showed interest in the 2 BHK units and asked about pricing. They mentioned they are looking for a property near the metro station. I explained that Prestige Mira Road is right on the Western Express Highway near Thakur Mall with excellent connectivity. The customer requested a callback next week to discuss further details.",
    "transcript": "Agent: Hi, this is Rekha from Prestige Group. We've recently launched an exciting new project in Mira Road called Prestige, and I'd love to share the details with you.\n\nCustomer: Oh, hello. I am actually looking for a property in that area. Can you tell me more?\n\nAgent: Absolutely! We have Prestige Mira Road, right on the Western Express Highway near Thakur Mall. It offers 1, 2, and 3 BHK homes with decks and 40+ amenities including a rooftop pool, clubhouse, and indoor games.\n\nCustomer: That sounds interesting. I'm particularly interested in 2 BHK units. What's the pricing?\n\nAgent: For 2 BHK units, the price is Rupees 1.59 Crore onwards, with a carpet area between 650–750 square feet. The location has excellent connectivity with metro, highways, schools, hospitals, and malls nearby.\n\nCustomer: That's within my budget range. I'm very interested. Can someone call me back next week to discuss this further?\n\nAgent: Perfect! I'll have our sales consultant call you back next week. Thank you for your interest!\n\nCustomer: Thank you, looking forward to it."
  }
};

async function sendTestData() {
  try {
    console.log('🚀 Sending test call data to webhook...');
    
    const response = await fetch('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCallData)
    });

    const result = await response.json();
    console.log('✅ Response:', result);
    
    if (response.ok) {
      console.log('🎉 Test call data sent successfully!');
      console.log('📊 Check your dashboard at http://localhost:3000');
    } else {
      console.error('❌ Error sending test data:', result);
    }
  } catch (error) {
    console.error('❌ Failed to send test data:', error);
  }
}

// Run the test
sendTestData();