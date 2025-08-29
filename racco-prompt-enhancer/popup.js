// popup.js - Updated for permanent Gemini configuration
const endpointEl = document.getElementById('endpoint');
const apiKeyEl = document.getElementById('apiKey');
const saveBtn = document.getElementById('save');
const testBtn = document.getElementById('test');
const status = document.getElementById('status');

function showStatus(message, isError = false) {
  status.style.color = isError ? 'red' : 'green';
  status.innerText = message;
  setTimeout(() => status.innerText = '', 4000);
}

// Show that permanent config is loaded
document.addEventListener('DOMContentLoaded', () => {
  showStatus('✅ Gemini API permanently configured and ready!');
  
  // Set display values for the disabled fields
  endpointEl.value = 'Permanent: Google Gemini API';
  apiKeyEl.value = '••••••••••••••••••••••••';
});

// Test function - works with permanent Gemini configuration
testBtn.addEventListener('click', () => {
  const sample = 'Write a guide for beginners';
  testBtn.disabled = true;
  testBtn.innerText = 'Testing Gemini...';
  
  showStatus('🧪 Testing Gemini API enhancement...');
  
  chrome.runtime.sendMessage({ type: 'ENHANCE_PROMPT', prompt: sample }, (resp) => {
    testBtn.disabled = false;
    testBtn.innerText = 'Test Gemini Enhancement';
    
    if (chrome.runtime.lastError) {
      showStatus('Extension error: ' + chrome.runtime.lastError.message, true);
      return;
    }
    
    if (!resp) {
      showStatus('No response from background script', true);
      return;
    }
    
    if (resp.ok) {
      showStatus('✅ Gemini API test successful! Check console for full output');
      console.log('=== RACCO Gemini Enhancement Test ===');
      console.log('🔑 Using permanent Gemini API key');
      console.log('📝 Original:', sample);
      console.log('🚀 Enhanced by Gemini:');
      console.log(resp.enhanced);
      console.log('=====================================');
    } else {
      showStatus('❌ Enhancement failed: ' + (resp.error || 'unknown error'), true);
      console.error('Enhancement error:', resp.error);
    }
  });
});

// Save button is disabled but show message if clicked
saveBtn.addEventListener('click', () => {
  showStatus('ℹ️ Settings are permanently configured in extension code', false);
});
