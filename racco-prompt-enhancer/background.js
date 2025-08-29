// background.js (service worker)
// Handles long-running tasks and proxying requests if needed.

// ============================================
// 🔑 PERMANENT API CONFIGURATION - SET ONCE
// ============================================
const PERMANENT_CONFIG = {
  // 🔥 Step 1: Choose your AI provider
  PROVIDER: "gemini", // Options: "openai", "anthropic", "gemini"
  
  // 🔥 Step 2: Add your API key here (REQUIRED)
  API_KEY: "AIzaSyDPTCBHf4dE9V02GkvoAjIIu-d2V-3Eg0M", // Your Gemini API key
  
  // 🔥 Step 3: Endpoint (auto-set based on provider, but you can override)
  DEFAULT_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  
  // ⚙️ Optional: Model settings
  OPENAI_MODEL: "gpt-4o-mini", // or "gpt-4", "gpt-3.5-turbo"
  ANTHROPIC_MODEL: "claude-3-haiku-20240307", // or "claude-3-sonnet-20240229"
  GEMINI_MODEL: "gemini-2.5-flash", // 
  
  // ⚙️ Optional: Generation settings  
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  
  // 🛡️ Security: Enable/disable features
  ALLOW_USER_ENDPOINTS: false, // Disabled - using permanent Gemini configuration
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('RACCO Prompt Enhancer installed');
  console.log('🔑 Using permanent API configuration');
});

// Enhanced prompt improvement function
function enhancePromptLocally(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    return prompt + '\n\n[Please provide a prompt to enhance]';
  }
  
  const enhancements = [
    '\n\n[Enhanced by RACCO with the following improvements:]',
    '• Added specific context and constraints',
    '• Included examples for better understanding',
    '• Clarified expected output format',
    '• Added role and perspective guidance'
  ];
  
  return prompt + enhancements.join('\n');
}

// Enhanced OpenAI API call function
async function callOpenAIAPI(prompt) {
  const response = await fetch(PERMANENT_CONFIG.DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERMANENT_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: PERMANENT_CONFIG.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a prompt enhancement expert. Take the user's prompt and make it more detailed, specific, and effective. Add context, constraints, examples, and clear instructions while preserving the original intent."
        },
        {
          role: "user", 
          content: `Please enhance this prompt: "${prompt}"`
        }
      ],
      max_tokens: PERMANENT_CONFIG.MAX_TOKENS,
      temperature: PERMANENT_CONFIG.TEMPERATURE
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Enhancement failed';
}

// Anthropic Claude API call function
async function callAnthropicAPI(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: 'POST',
    headers: {
      'x-api-key': PERMANENT_CONFIG.API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: PERMANENT_CONFIG.ANTHROPIC_MODEL,
      max_tokens: PERMANENT_CONFIG.MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `You are a prompt enhancement expert. Please enhance this prompt to be more detailed, specific, and effective: "${prompt}"`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'Enhancement failed';
}

// Google Gemini API call function
async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${PERMANENT_CONFIG.GEMINI_MODEL}:generateContent?key=${PERMANENT_CONFIG.API_KEY}`;
  
  const enhancementPrompt = `You are an expert prompt engineer. Take the following prompt and enhance it to be more specific, detailed, and effective. Add context, constraints, examples, and clear output format requirements while preserving the original intent.

Original prompt: "${prompt}"

Enhanced prompt:`;

  const requestBody = {
    contents: [{
      parts: [{
        text: enhancementPrompt
      }]
    }],
    generationConfig: {
      temperature: PERMANENT_CONFIG.TEMPERATURE,
      maxOutputTokens: PERMANENT_CONFIG.MAX_TOKENS,
    }
  };

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

  return data.candidates[0].content.parts[0].text;
}

// Universal API caller based on provider
async function callAPI(prompt) {
  switch (PERMANENT_CONFIG.PROVIDER.toLowerCase()) {
    case 'openai':
      return await callOpenAIAPI(prompt);
    case 'anthropic':
      return await callAnthropicAPI(prompt);
    case 'gemini':
      return await callGeminiAPI(prompt);
    default:
      throw new Error(`Unsupported provider: ${PERMANENT_CONFIG.PROVIDER}`);
  }
}

// Example: listen for one-off messages from content scripts or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'ENHANCE_PROMPT') {
    (async () => {
      try {
        let enhanced = '';
        
        // 🔥 PERMANENT API KEY LOGIC - No user input needed!
        if (PERMANENT_CONFIG.API_KEY && PERMANENT_CONFIG.API_KEY !== "sk-your-openai-api-key-here") {
          try {
            console.log(`🚀 Using permanent ${PERMANENT_CONFIG.PROVIDER.toUpperCase()} API key`);
            enhanced = await callAPI(msg.prompt);
            console.log('✅ API enhancement successful');
          } catch (apiError) {
            console.warn(`❌ ${PERMANENT_CONFIG.PROVIDER} API failed, using local enhancement:`, apiError.message);
            enhanced = enhancePromptLocally(msg.prompt);
          }
        } else if (PERMANENT_CONFIG.ALLOW_USER_ENDPOINTS) {
          // Check if user has configured a custom endpoint via popup
          const result = await chrome.storage.sync.get(['endpoint']);
          const endpoint = result.endpoint;
          
          if (endpoint && endpoint.endpoint && endpoint.endpoint.trim()) {
            try {
              console.log('Using custom endpoint:', endpoint.endpoint);
              const response = await fetch(endpoint.endpoint, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ prompt: msg.prompt })
              });
              
              if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
              }
              
              const data = await response.json();
              enhanced = data.enhanced || data.result || data.text || data.response || '';
              
              if (!enhanced) {
                throw new Error('Server response did not contain enhanced text');
              }
            } catch (fetchError) {
              console.warn('Custom endpoint failed, falling back to local enhancement:', fetchError);
              enhanced = enhancePromptLocally(msg.prompt);
            }
          } else {
            // Use local enhancement as final fallback
            console.log('⚠️ No API key configured and no custom endpoint - add your API key to PERMANENT_CONFIG');
            enhanced = enhancePromptLocally(msg.prompt);
          }
        } else {
          // User endpoints disabled, use local enhancement only
          console.log('⚠️ User endpoints disabled and no permanent API key configured');
          enhanced = enhancePromptLocally(msg.prompt);
        }
        
        sendResponse({ ok: true, enhanced });
        
      } catch (err) {
        console.error('Background script error:', err);
        sendResponse({ ok: false, error: err.message });
      }
    })();

    // indicate async response
    return true;
  }
});
