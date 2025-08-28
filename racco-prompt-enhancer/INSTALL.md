# 🚀 RACCO Prompt Enhancer - Installation Guide

## Step-by-Step Installation

### 1. Download/Access Extension Files
Ensure you have the complete `racco-prompt-enhancer/` folder with all files:
- ✅ manifest.json
- ✅ background.js  
- ✅ content_script.js
- ✅ popup.html & popup.js
- ✅ icons/ folder with PNG files
- ✅ All supporting files

### 2. Open Chrome Extensions Page
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar
3. Press Enter

### 3. Enable Developer Mode
1. Look for "Developer mode" toggle in the top-right corner
2. Click to enable it (should turn blue/on)
3. New buttons will appear: "Load unpacked", "Pack extension", "Update"

### 4. Load the Extension
1. Click the **"Load unpacked"** button
2. Browse to and select the `racco-prompt-enhancer/` folder
3. Click "Select Folder" (or "Open" depending on your OS)

### 5. Verify Installation
✅ **Extension should appear** in your extensions list  
✅ **RACCO icon should appear** in Chrome toolbar  
✅ **No error messages** should be displayed

### 6. Test the Extension
1. Open the included `test-page.html` file in Chrome
2. You should see "Enhance" buttons next to all text inputs
3. Type some text and click "Enhance" to test functionality

## 🧪 Optional: Test with Local Server

### Start Test Server
```bash
cd racco-prompt-enhancer/
node test-server.js
```

### Configure Extension
1. Click the RACCO icon in Chrome toolbar
2. Set endpoint to: `http://localhost:3000/enhance`  
3. Click "Save"
4. Click "Test Enhance" to verify connection

## ✅ Success Indicators

**Extension Working Properly:**
- "Enhance" buttons appear on text inputs across websites
- Clicking "Enhance" modifies the text content
- No console errors in browser dev tools
- Popup opens when clicking extension icon

**Common Issues & Fixes:**
- **No buttons visible**: Refresh the webpage
- **Buttons don't work**: Check browser console for errors
- **Extension not loading**: Verify all files are present
- **Permission errors**: Make sure Developer Mode is enabled

## 🎯 Next Steps

1. **Test on Real Websites**: Visit Gmail, GitHub, or any site with text inputs
2. **Configure Custom Endpoint**: Set up your own LLM server for production use  
3. **Customize Enhancement Logic**: Modify `background.js` for specific use cases
4. **Share & Deploy**: Package for Chrome Web Store when ready

---

**Need Help?** Check the console logs in Chrome DevTools for detailed error information.
