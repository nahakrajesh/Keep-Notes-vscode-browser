# Notepad Keeper — Chrome Browser Extension

A quick-capture popup to save notes directly to your VS Code Notepad Keeper from any browser tab.

---

## Features

- Clean, modern popup UI
- Title + content + color picker + pin toggle
- Quick save with `Cmd+Enter` (or `Ctrl+Enter`)
- Connection status indicator (green = VS Code connected)
- Shows your 5 most recent notes
- Sends notes to VS Code via local HTTP server

---

## Installation

### Step 1: Open Chrome Extensions Page

1. Open Google Chrome
2. Go to `chrome://extensions` in the address bar
3. Enable **Developer mode** (toggle in the top-right corner)

### Step 2: Load the Extension

1. Click **"Load unpacked"** button (top-left)
2. Navigate to and select the `browser-extension/` folder
3. The extension will appear in your extensions list

### Step 3: Pin to Toolbar

1. Click the puzzle piece icon in Chrome toolbar (Extensions menu)
2. Find **"Notepad Keeper"**
3. Click the pin icon to keep it visible in your toolbar

---

## How It Works

1. Click the Notepad Keeper icon in your Chrome toolbar
2. Write your note (title + content)
3. Optionally pick a color and toggle pin
4. Click **"Save to Notepad"** (or press `Cmd+Enter`)
5. The note is sent to VS Code via `http://127.0.0.1:52437`
6. It appears instantly in your VS Code sidebar notepad

---

## Usage

### Save a Note
1. Click the extension icon in Chrome toolbar
2. Type a title (optional) and content
3. Choose a color if you want
4. Check "Pin this note" if it's important
5. Click **"Save to Notepad"**

### Keyboard Shortcut
- `Cmd + Enter` (Mac) or `Ctrl + Enter` (Windows/Linux) — Quick save

### Connection Status
- **Green dot** = VS Code is running and connected
- **Red dot** = VS Code is not running or extension is not active
- **Yellow dot** = Checking connection...

> Notes can only be saved when VS Code is running with the Notepad Keeper extension active.

### Recent Notes
- The bottom of the popup shows your 5 most recent notes
- This section only appears when VS Code is connected

---

## Requirements

- **Google Chrome** (or any Chromium-based browser: Edge, Brave, Arc, etc.)
- **VS Code** must be running with the Notepad Keeper extension installed
- The VS Code extension starts a local server on port `52437`

---

## For Other Browsers

### Microsoft Edge
1. Go to `edge://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select `browser-extension/` folder

### Brave
1. Go to `brave://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select `browser-extension/` folder

### Arc
1. Go to `arc://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select `browser-extension/` folder

---

## Troubleshooting

### "Could not connect to VS Code" error
- Make sure VS Code is open
- Make sure the Notepad Keeper VS Code extension is installed and active
- Check that nothing else is using port 52437

### Extension not showing in toolbar?
- Go to `chrome://extensions` and make sure it's enabled
- Click the puzzle piece icon and pin the extension

### Notes not saving?
- Check the connection status dot (should be green)
- Open VS Code first, then try saving again

---

## File Structure

```
browser-extension/
├── manifest.json    ← Chrome extension manifest (Manifest V3)
├── popup.html       ← Popup UI layout
├── popup.css        ← Styling (modern, Google Keep-inspired)
├── popup.js         ← Save logic, connection check, color picker
└── icon.png         ← Extension icon
```
