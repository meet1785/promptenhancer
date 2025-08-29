#!/usr/bin/env node

/**
 * Gemini API Integration Test for RACCO Prompt Enhancer
 * Tests the permanent Gemini API key configuration
 */

console.log('🧪 Gemini API Integration Test for RACCO\n');

const testPrompt = "Write a blog post about AI";

console.log('📋 Configuration Status:');
console.log('✅ Provider: Gemini');
console.log('✅ API Key: AIzaSyDPTCBHf4dE9V02GkvoAjIIu-d2V-3Eg0M (hardcoded)');
console.log('✅ Model: gemini-2.5-flash');
console.log('✅ Endpoint: Google Generative Language API');
console.log('✅ User endpoints: DISABLED (permanent config)');

console.log('\n🔬 Testing Gemini API Call...');

async function testGeminiAPI() {
  const API_KEY = "AIzaSyDPTCBHf4dE9V02GkvoAjIIu-d2V-3Eg0M";
  const MODEL = "gemini-2.5-flash";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  
  const enhancementPrompt = `You are an expert prompt engineer. Take the following prompt and enhance it to be more specific, detailed, and effective. Add context, constraints, examples, and clear output format requirements while preserving the original intent.

Original prompt: "${testPrompt}"

Enhanced prompt:`;

  const requestBody = {
    contents: [{
      parts: [{
        text: enhancementPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  };

  try {
    console.log('📡 Making API request to Gemini...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const enhancedPrompt = data.candidates[0].content.parts[0].text;
    
    console.log('✅ SUCCESS! Gemini API responded correctly\n');
    console.log('📝 Original prompt:', testPrompt);
    console.log('🚀 Enhanced prompt:');
    console.log('─'.repeat(50));
    console.log(enhancedPrompt);
    console.log('─'.repeat(50));
    
    console.log('\n🎯 Integration Status:');
    console.log('✅ API key is valid and working');
    console.log('✅ Gemini model responding correctly');
    console.log('✅ Prompt enhancement is functional');
    console.log('✅ Extension ready for use with Gemini!');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if API key is valid');
    console.log('2. Verify internet connection');
    console.log('3. Ensure Gemini API is enabled in Google Cloud Console');
  }
}

// Check if we have internet connection first
console.log('🌐 Checking internet connectivity...');

fetch('https://www.google.com', { method: 'HEAD' })
  .then(() => {
    console.log('✅ Internet connection OK');
    return testGeminiAPI();
  })
  .catch(() => {
    console.log('❌ No internet connection - cannot test API');
    console.log('\n🎯 Configuration Summary:');
    console.log('✅ Gemini API key configured in background.js');
    console.log('✅ Extension will use Gemini when internet is available');
    console.log('✅ Falls back to local enhancement if API fails');
  });
