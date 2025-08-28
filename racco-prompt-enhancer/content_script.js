// content_script.js
// Injects a small 'Enhance' button next to textareas and input[type=text]

function createButton() {
  const btn = document.createElement('button');
  btn.innerText = 'Enhance';
  btn.className = 'racco-enhance-btn';
  btn.type = 'button';
  btn.title = 'Enhance this prompt using RACCO Prompt Enhancer';
  return btn;
}

function attachTo(el) {
  if (el.dataset.raccoAttached) return;
  el.dataset.raccoAttached = '1';

  // Check if element is already in a flex container or has specific positioning
  const computedStyle = window.getComputedStyle(el);
  const parentStyle = window.getComputedStyle(el.parentNode);
  
  // Create wrapper only if it won't break the layout
  let needsWrapper = true;
  if (parentStyle.display === 'flex' || parentStyle.display === 'grid' || 
      computedStyle.position === 'absolute' || computedStyle.position === 'fixed') {
    needsWrapper = false;
  }

  if (needsWrapper) {
    const wrapper = document.createElement('div');
    wrapper.className = 'racco-wrapper';
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.width = el.style.width || el.clientWidth + 'px';

    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    
    const btn = createButton();
    wrapper.appendChild(btn);
    
    btn.addEventListener('click', createClickHandler(el, btn));
  } else {
    // For complex layouts, position button absolutely
    const btn = createButton();
    btn.style.position = 'absolute';
    btn.style.zIndex = '10000';
    btn.style.fontSize = '10px';
    btn.style.padding = '2px 4px';
    
    // Position button at top-right of element
    const rect = el.getBoundingClientRect();
    btn.style.left = (rect.right - 60) + 'px';
    btn.style.top = rect.top + 'px';
    
    document.body.appendChild(btn);
    
    // Update position on scroll/resize
    const updatePosition = () => {
      const rect = el.getBoundingClientRect();
      btn.style.left = (rect.right - 60) + 'px';
      btn.style.top = rect.top + 'px';
    };
    
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    btn.addEventListener('click', createClickHandler(el, btn));
  }
}

function createClickHandler(el, btn) {
  return async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerText = 'Enhancing...';
    
    // Better text extraction for different element types
    let original = '';
    if ('value' in el) {
      original = el.value || '';
    } else if (el.contentEditable === 'true') {
      original = el.textContent || el.innerText || '';
    } else {
      original = el.innerText || el.textContent || '';
    }
    
    // ask background to enhance
    chrome.runtime.sendMessage({ type: 'ENHANCE_PROMPT', prompt: original }, (resp) => {
      if (chrome.runtime.lastError) {
        console.error('Extension context invalidated:', chrome.runtime.lastError);
        alert('Extension error: Please refresh the page and try again.');
        btn.disabled = false;
        btn.innerText = 'Enhance';
        return;
      }
      
      if (!resp) {
        alert('No response from enhancer.');
        btn.disabled = false;
        btn.innerText = 'Enhance';
        return;
      }
      
      if (resp.ok) {
        // Better text insertion for different element types
        if ('value' in el) {
          el.value = resp.enhanced;
          // Trigger input event for frameworks that listen to it
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (el.contentEditable === 'true') {
          el.textContent = resp.enhanced;
          // Trigger input event for contenteditable
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          el.innerText = resp.enhanced;
        }
      } else {
        alert('Enhancer error: ' + (resp.error || 'unknown'));
      }
      btn.disabled = false;
      btn.innerText = 'Enhance';
    });
  };
}

function scanAndAttach() {
  const selectors = 'textarea, input[type=text], [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]';
  const els = Array.from(document.querySelectorAll(selectors));
  els.forEach(attachTo);
}

// initial run
scanAndAttach();

// observe DOM additions to attach dynamically
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches && (node.matches('textarea') || node.matches('input[type=text]') || node.matches('[contenteditable="true"]') || node.matches('[contenteditable=""]') || node.matches('[contenteditable="plaintext-only"]'))) {
        attachTo(node);
      }
      // also check descendants
      const descendants = node.querySelectorAll ? node.querySelectorAll('textarea, input[type=text], [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]') : [];
      descendants.forEach(attachTo);
    }
  }
});
observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

// inject minimal style
const style = document.createElement('style');
style.textContent = `
.racco-enhance-btn{ 
  margin-left: 8px; 
  padding: 4px 8px; 
  border: 1px solid #4285f4;
  border-radius: 4px; 
  background: #4285f4;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.racco-enhance-btn:hover {
  background: #3367d6;
  border-color: #3367d6;
}
.racco-enhance-btn:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
.racco-wrapper{ 
  display: inline-flex; 
  align-items: flex-start;
  width: 100%;
  gap: 8px;
}
.racco-wrapper textarea,
.racco-wrapper input[type="text"] {
  flex: 1;
}
`;
document.head.appendChild(style);
