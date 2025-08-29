#!/usr/bin/env node

/**
 * Simple test server for RACCO Prompt Enhancer
 * Run with: node test-server.js
 * Then set endpoint to: http://localhost:3000/enhance
 */

const http = require('http');
const url = require('url');

const PORT = 3000;

// Simple prompt enhancement function
function enhancePrompt(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    return '[No prompt provided]';
  }
  
  const enhancements = [
    `Enhanced version of: "${prompt}"`,
    '',
    '## Context & Role',
    'You are an expert assistant helping with this specific task.',
    '',
    '## Detailed Requirements',
    '• Provide comprehensive information',
    '• Use clear, structured formatting',
    '• Include relevant examples where helpful',
    '• Consider edge cases and alternatives',
    '',
    '## Expected Output Format',
    'Structure your response with clear headings and bullet points.',
    '',
    '## Additional Guidelines',
    '• Be specific and actionable',
    '• Cite sources when relevant',
    '• Ask clarifying questions if the request is ambiguous'
  ];
  
  return enhancements.join('\n');
}

const server = http.createServer((req, res) => {
  // Enable CORS for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  const parsedUrl = url.parse(req.url, true);
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/enhance') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const prompt = data.prompt || '';
        const apiKey = data.apiKey || req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
        
        // Log API key usage (first 10 chars only for security)
        if (apiKey) {
          console.log(`[${new Date().toLocaleTimeString()}] API Key received: ${apiKey.substring(0, 10)}...`);
        }
        
        // In production, validate API key here
        // For demo, we'll accept any API key
        const enhanced = enhancePrompt(prompt);
        
        const response = {
          ok: true,
          enhanced: enhanced,
          original: prompt,
          timestamp: new Date().toISOString(),
          authenticated: !!apiKey
        };
        
        console.log(`[${new Date().toLocaleTimeString()}] Enhanced prompt:`, prompt.substring(0, 50) + '...');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    
  } else if (req.method === 'GET' && parsedUrl.pathname === '/') {
    // Simple status page
    const html = `
<!DOCTYPE html>
<html>
<head><title>RACCO Test Server</title></head>
<body>
  <h1>🚀 RACCO Prompt Enhancer Test Server</h1>
  <p>Server is running on port ${PORT}</p>
  <p><strong>Endpoint:</strong> <code>http://localhost:${PORT}/enhance</code></p>
  <p><strong>Method:</strong> POST</p>
  <p><strong>Payload:</strong> <code>{"prompt": "your prompt here"}</code></p>
  
  <h2>Test the endpoint:</h2>
  <textarea id="prompt" placeholder="Enter your prompt here..." rows="4" cols="50"></textarea><br>
  <button onclick="testEnhance()">Enhance Prompt</button>
  <pre id="result" style="background: #f0f0f0; padding: 10px; margin-top: 10px;"></pre>
  
  <script>
    async function testEnhance() {
      const prompt = document.getElementById('prompt').value;
      const result = document.getElementById('result');
      
      try {
        const response = await fetch('/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        result.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        result.textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 RACCO Test Server running at http://localhost:${PORT}`);
  console.log(`📝 Set extension endpoint to: http://localhost:${PORT}/enhance`);
  console.log(`🌐 Visit http://localhost:${PORT} for status page`);
});

module.exports = server;
