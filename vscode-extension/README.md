# Notepad Keeper — VS Code Extension

A beautiful Google Keep-style notepad that lives in your VS Code sidebar. Access your notes from any workspace/repo.

---

## Features

- Google Keep-style note cards with 12 color options
- Pin important notes to the top
- Search and filter notes instantly
- Keyboard shortcuts (Cmd+S to save, Esc to go back)
- Delete notes with confirmation
- Syncs with the Chrome browser extension
- Works across ALL workspaces — notes are stored globally

---

## Installation

### Prerequisites

- **Node.js >= 20** (check with `node -v`)
- If using nvm: `nvm use 20`

### Step 1: Package the Extension

```bash
cd vscode-extension
npm install -g @vscode/vsce
vsce package --allow-missing-repository
```

This creates a file: `notepad-keeper-1.0.0.vsix`

### Step 2: Install in VS Code

**Option A — Using terminal:**

```bash
code --install-extension notepad-keeper-1.0.0.vsix
```

> If `code` command not found:
> Open VS Code → Cmd+Shift+P → type "Shell Command: Install 'code' command in PATH"

**Option B — From inside VS Code:**

1. Open VS Code
2. Press `Cmd + Shift + P`
3. Type `Extensions: Install from VSIX...`
4. Select the `notepad-keeper-1.0.0.vsix` file

### Step 3: Reload VS Code

After installing, reload VS Code (Cmd+Shift+P → "Developer: Reload Window").

You'll see a **notepad icon** in the left activity bar (sidebar).

---

## How It Works

- Notes are stored at `~/.vscode-notepad/notes.json`
- This is a **global** location — your notes are available in every repo/workspace
- The extension runs a local HTTP server on port `52437` for the browser extension to send notes
- The server starts automatically when VS Code opens

---

## Usage

### Add a Note
- Click the **"+ New Note"** button in the sidebar
- Or run command: `Cmd+Shift+P` → "Notepad Keeper: New Note"

### Edit a Note
- Click any note card to open the editor
- Change title, content, color, or pin status
- Press `Cmd+S` to save or click the Save button

### Delete a Note
- Hover over a note card
- Click the trash icon (bottom right)
- Confirm deletion

### Search Notes
- Use the search bar at the top of the sidebar
- Filters by title and content in real-time

### Pin a Note
- Hover over a note and click the pin icon
- Pinned notes always appear at the top

### Color Code Notes
- Open a note in the editor
- Pick a color from the palette (coral, peach, mint, storm, dusk, etc.)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + S` | Save note (in editor) |
| `Esc` | Close editor / go back |

---

## Troubleshooting

### Extension not showing in sidebar?
- Make sure you reloaded VS Code after installing
- Check Extensions panel (Cmd+Shift+X) → search "Notepad Keeper" → make sure it's enabled

### Port 52437 already in use?
- Another VS Code window might be running the server
- Close other VS Code windows, or the extension will still work for local notes (just browser sync won't work in that window)

### Notes not appearing?
- Check the file exists: `cat ~/.vscode-notepad/notes.json`
- If corrupted, delete it and the extension will create a fresh one

---

## File Structure

```
vscode-extension/
├── package.json          ← Extension manifest
├── extension.js          ← Main entry: HTTP server + commands
├── notesManager.js       ← CRUD operations on notes.json
├── sidebarProvider.js    ← Webview UI (Google Keep-style)
└── media/
    └── notepad.svg       ← Activity bar icon
```
