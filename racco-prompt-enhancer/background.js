// background.js (service worker)
// Handles long-running tasks and proxying requests if needed.

chrome.runtime.onInstalled.addListener(() => {
  console.log('RACCO Prompt Enhancer installed');
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

// Example: listen for one-off messages from content scripts or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'ENHANCE_PROMPT') {
    // route to a fetch or other processing
    // NOTE: for security, keep API keys out of client-side code; prefer server proxy
    (async () => {
      try {
        // If user has configured a server endpoint in storage, use it
        const result = await chrome.storage.sync.get(['endpoint']);
        const endpoint = result.endpoint;
        
        if (endpoint && endpoint.endpoint && endpoint.endpoint.trim()) {
          try {
            console.log('Using external endpoint:', endpoint.endpoint);
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
            const enhanced = data.enhanced || data.result || data.text || data.response || '';
            
            if (!enhanced) {
              throw new Error('Server response did not contain enhanced text');
            }
            
            sendResponse({ ok: true, enhanced });
          } catch (fetchError) {
            console.warn('External endpoint failed, falling back to local enhancement:', fetchError);
            // Fallback to local enhancement
            const enhanced = enhancePromptLocally(msg.prompt);
            sendResponse({ ok: true, enhanced });
          }
        } else {
          // Use local enhancement
          console.log('Using local enhancement (no endpoint configured)');
          const enhanced = enhancePromptLocally(msg.prompt);
          sendResponse({ ok: true, enhanced });
        }
      } catch (err) {
        console.error('Background script error:', err);
        sendResponse({ ok: false, error: err.message });
      }
    })();

    // indicate async response
    return true;
  }
});
