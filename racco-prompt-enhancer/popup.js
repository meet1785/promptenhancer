// popup.js
const endpointEl = document.getElementById('endpoint');
const apiKeyEl = document.getElementById('apiKey');
const saveBtn = document.getElementById('save');
const testBtn = document.getElementById('test');
const status = document.getElementById('status');

function showStatus(message, isError = false) {
  status.style.color = isError ? 'red' : 'green';
  status.innerText = message;
  setTimeout(() => status.innerText = '', 3000);
}

// load stored settings
chrome.storage.sync.get(['endpoint', 'apiKey'], ({ endpoint, apiKey }) => {
  if (endpoint && endpoint.endpoint) {
    endpointEl.value = endpoint.endpoint;
  }
  if (apiKey) {
    apiKeyEl.value = apiKey;
  }
});

saveBtn.addEventListener('click', () => {
  const endpointValue = endpointEl.value.trim();
  const apiKeyValue = apiKeyEl.value.trim();
  
  // Validate endpoint URL if provided
  if (endpointValue && !endpointValue.startsWith('http')) {
    showStatus('Endpoint must start with http:// or https://', true);
    return;
  }
  
  chrome.storage.sync.set({ 
    endpoint: { endpoint: endpointValue }, 
    apiKey: apiKeyValue 
  }, () => {
    if (chrome.runtime.lastError) {
      showStatus('Error saving settings: ' + chrome.runtime.lastError.message, true);
    } else {
      showStatus('Settings saved successfully!');
    }
  });
});

// test by sending a message to the background to enhance a sample prompt
testBtn.addEventListener('click', () => {
  const sample = 'Write a summary of a technical article';
  testBtn.disabled = true;
  testBtn.innerText = 'Testing...';
  
  chrome.runtime.sendMessage({ type: 'ENHANCE_PROMPT', prompt: sample }, (resp) => {
    testBtn.disabled = false;
    testBtn.innerText = 'Test Enhance';
    
    if (chrome.runtime.lastError) {
      showStatus('Extension error: ' + chrome.runtime.lastError.message, true);
      return;
    }
    
    if (!resp) {
      showStatus('No response from background script', true);
      return;
    }
    
    if (resp.ok) {
      showStatus('Test successful! Check console for output');
      console.log('=== RACCO Enhancement Test ===');
      console.log('Original:', sample);
      console.log('Enhanced:', resp.enhanced);
      console.log('===========================');
    } else {
      showStatus('Enhancement failed: ' + (resp.error || 'unknown error'), true);
    }
  });
});
