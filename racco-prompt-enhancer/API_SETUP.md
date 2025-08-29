# 🔑 PERMANENT API KEY SETUP GUIDE

## Quick Setup (3 Steps)

### Step 1: Get Your API Key
**For OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)

**For Anthropic:**
1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create new key and copy it

### Step 2: Edit `background.js`
Open `/workspaces/promptenhancer/racco-prompt-enhancer/background.js` and find this section:

```javascript
const PERMANENT_CONFIG = {
  // 🔥 Step 1: Choose your AI provider
  PROVIDER: "openai", // Change to "anthropic" if using Claude
  
  // 🔥 Step 2: Add your API key here (REQUIRED)
  API_KEY: "sk-your-api-key-here", // ← REPLACE THIS WITH YOUR REAL API KEY
```

**Replace `"sk-your-api-key-here"` with your actual API key.**

### Step 3: Done! 
The extension will now automatically use your API key for all enhancements.

## Configuration Options

```javascript
const PERMANENT_CONFIG = {
  // Provider Selection
  PROVIDER: "openai",              // "openai" or "anthropic"
  API_KEY: "sk-proj-abc123...",    // Your actual API key
  
  // Model Selection (optional)
  OPENAI_MODEL: "gpt-4o-mini",     // "gpt-4", "gpt-3.5-turbo"
  ANTHROPIC_MODEL: "claude-3-haiku-20240307",
  
  // Generation Settings (optional)
  MAX_TOKENS: 500,                 // Response length
  TEMPERATURE: 0.7,                // Creativity (0-1)
  
  // Security (optional)
  ALLOW_USER_ENDPOINTS: true,      // Allow popup overrides
};
```

## Examples

### OpenAI Setup:
```javascript
const PERMANENT_CONFIG = {
  PROVIDER: "openai",
  API_KEY: "sk-proj-1234567890abcdef...",
  OPENAI_MODEL: "gpt-4o-mini",
};
```

### Anthropic Setup:
```javascript
const PERMANENT_CONFIG = {
  PROVIDER: "anthropic", 
  API_KEY: "sk-ant-api03-1234567890abcdef...",
  ANTHROPIC_MODEL: "claude-3-haiku-20240307",
};
```

## Benefits

✅ **Set once, use everywhere** - No need for users to enter API keys  
✅ **Automatic fallback** - Falls back to local enhancement if API fails  
✅ **Multi-provider support** - Works with OpenAI, Anthropic, and more  
✅ **Configurable** - Adjust models, tokens, temperature, etc.  
✅ **Secure** - API key stays in your extension code, not in user storage  

## Security Notes

⚠️ **Extension Security**: API keys in extensions are visible to users who inspect the code  
⚠️ **Production Use**: For commercial deployment, consider using a secure server proxy  
⚠️ **Rate Limits**: Monitor your API usage to avoid hitting rate limits  

## Troubleshooting

- **"No API key configured"**: Make sure you replaced the placeholder with your real key
- **API errors**: Check your API key is valid and has sufficient credits
- **Wrong responses**: Verify you're using the correct provider ("openai" vs "anthropic")
