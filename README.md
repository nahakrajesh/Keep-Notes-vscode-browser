# Notepad Keeper

A Google Keep-style note-taking system with two parts:

1. **VS Code Extension** — A sidebar notepad accessible from any workspace
2. **Chrome Extension** — A quick-capture popup to save notes from your browser

Both share the same notes, stored globally at `~/.vscode-notepad/notes.json`.

---

## Quick Start

### 1. Install VS Code Extension

```bash
cd vscode-extension
nvm use 20
npm install -g @vscode/vsce
vsce package --allow-missing-repository
```

Then in VS Code: `Cmd+Shift+P` → "Extensions: Install from VSIX..." → select `notepad-keeper-1.0.0.vsix`

Reload VS Code. Notepad icon appears in the left sidebaras.

### 2. Install Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **"Load unpacked"** → select the `browser-extension/` folder
4. Pin it to your toolbar

### 3. Start Using

- **In VS Code**: Click the notepad icon → create, edit, search, pin, color-code notes
- **In Chrome**: Click the extension icon → write a note → Save to Notepad
- Notes sync between both instantly

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Chrome Extension   │  HTTP   │  VS Code Extension   │
│  (popup.html/js)    │────────>│  (extension.js)      │
│                     │  POST   │                      │
│  Quick capture UI   │ :52437  │  Sidebar webview UI  │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  ~/.vscode-notepad/  │
                                │  notes.json          │
                                │                      │
                                │  Global storage      │
                                │  (all workspaces)    │
                                └──────────────────────┘
```

---

## Folder Structure

```
notepad/
├── README.md                    ← You are here
├── vscode-extension/            ← VS Code sidebar notepad
│   ├── README.md                ← VS Code setup instructions
│   ├── package.json
│   ├── extension.js
│   ├── notesManager.js
│   ├── sidebarProvider.js
│   └── media/notepad.svg
│
└── browser-extension/           ← Chrome quick-capture popup
    ├── README.md                ← Chrome setup instructions
    ├── manifest.json
    ├── popup.html
    ├── popup.css
    ├── popup.js
    └── icon.png
```

---

See individual README files in each folder for detailed instructions.
