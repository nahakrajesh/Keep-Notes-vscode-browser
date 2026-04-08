const vscode = require('vscode');

class SidebarProvider {
  constructor(extensionUri, notesManager) {
    this._extensionUri = extensionUri;
    this._notesManager = notesManager;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case 'getNotes':
          this._sendNotes();
          break;
        case 'addNote':
          this._notesManager.addNote(data.note);
          this._sendNotes();
          break;
        case 'updateNote':
          this._notesManager.updateNote(data.id, data.updates);
          this._sendNotes();
          break;
        case 'deleteNote':
          this._notesManager.deleteNote(data.id);
          this._sendNotes();
          break;
        case 'showInfo':
          vscode.window.showInformationMessage(data.message);
          break;
      }
    });
  }

  refresh() {
    if (this._view) {
      this._sendNotes();
    }
  }

  addNewNote() {
    if (this._view) {
      this._view.webview.postMessage({ type: 'triggerNewNote' });
      this._view.show?.(true);
    }
  }

  _sendNotes() {
    if (this._view) {
      const notes = this._notesManager.getAllNotes();
      this._view.webview.postMessage({ type: 'notesData', notes });
    }
  }

  _getHtml() {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* ── Reset & Base ── */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 13px;
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    overflow-x: hidden;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-hoverBackground); }

  /* ── Header ── */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    padding: 12px 12px 8px;
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
  }

  .search-box {
    display: flex;
    align-items: center;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 8px;
    padding: 6px 10px;
    gap: 8px;
    transition: border-color 0.2s;
  }
  .search-box:focus-within {
    border-color: var(--vscode-focusBorder);
  }
  .search-box svg { flex-shrink: 0; opacity: 0.5; }
  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--vscode-input-foreground);
    font-size: 12px;
  }
  .search-box input::placeholder {
    color: var(--vscode-input-placeholderForeground);
  }

  .btn-new {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-top: 8px;
    padding: 8px 12px;
    border: 2px dashed var(--vscode-button-secondaryBackground, rgba(128,128,128,0.3));
    border-radius: 8px;
    background: transparent;
    color: var(--vscode-button-foreground, var(--vscode-foreground));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-new:hover {
    background: var(--vscode-button-secondaryHoverBackground, rgba(128,128,128,0.15));
    border-color: var(--vscode-focusBorder);
  }

  /* ── Notes List ── */
  .notes-container {
    padding: 8px 12px 80px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    padding: 12px 4px 6px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;
    opacity: 0.6;
  }
  .empty-state svg { margin-bottom: 12px; opacity: 0.4; }
  .empty-state p { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.5; }

  /* ── Note Card ── */
  .note-card {
    position: relative;
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.2));
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    overflow: hidden;
  }
  .note-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    border-radius: 8px 0 0 8px;
    background: transparent;
    transition: background 0.15s;
  }
  .note-card:hover {
    border-color: var(--vscode-focusBorder);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .note-card .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .note-card .card-title {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    flex: 1;
    word-break: break-word;
  }
  .note-card .card-title.untitled {
    opacity: 0.5;
    font-style: italic;
  }
  .note-card .card-content {
    font-size: 12px;
    line-height: 1.5;
    color: var(--vscode-descriptionForeground);
    margin-top: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .note-card .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    gap: 4px;
  }
  .note-card .card-date {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
    opacity: 0.7;
  }
  .note-card .card-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .note-card:hover .card-actions { opacity: 1; }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--vscode-foreground);
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.15s;
  }
  .icon-btn:hover {
    opacity: 1;
    background: var(--vscode-toolbar-hoverBackground, rgba(128,128,128,0.2));
  }
  .icon-btn.pinned { opacity: 1; color: var(--vscode-textLink-foreground); }

  /* ── Note Colors ── */
  .note-card[data-color="coral"]::before { background: #f28b82; }
  .note-card[data-color="peach"]::before { background: #fbbc04; }
  .note-card[data-color="sand"]::before { background: #fff475; }
  .note-card[data-color="mint"]::before { background: #ccff90; }
  .note-card[data-color="sage"]::before { background: #a7ffeb; }
  .note-card[data-color="fog"]::before { background: #cbf0f8; }
  .note-card[data-color="storm"]::before { background: #aecbfa; }
  .note-card[data-color="dusk"]::before { background: #d7aefb; }
  .note-card[data-color="blossom"]::before { background: #fdcfe8; }
  .note-card[data-color="clay"]::before { background: #e6c9a8; }
  .note-card[data-color="chalk"]::before { background: #e8eaed; }

  .note-card[data-color="coral"] { border-left-color: #f28b82; }
  .note-card[data-color="peach"] { border-left-color: #fbbc04; }
  .note-card[data-color="sand"] { border-left-color: #fff475; }
  .note-card[data-color="mint"] { border-left-color: #ccff90; }
  .note-card[data-color="sage"] { border-left-color: #a7ffeb; }
  .note-card[data-color="fog"] { border-left-color: #cbf0f8; }
  .note-card[data-color="storm"] { border-left-color: #aecbfa; }
  .note-card[data-color="dusk"] { border-left-color: #d7aefb; }
  .note-card[data-color="blossom"] { border-left-color: #fdcfe8; }
  .note-card[data-color="clay"] { border-left-color: #e6c9a8; }
  .note-card[data-color="chalk"] { border-left-color: #e8eaed; }

  /* ── Editor Overlay ── */
  .editor-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    display: flex;
    flex-direction: column;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    gap: 8px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.2));
  }
  .editor-toolbar .back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--vscode-textLink-foreground);
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.15s;
  }
  .editor-toolbar .back-btn:hover {
    background: var(--vscode-toolbar-hoverBackground, rgba(128,128,128,0.2));
  }
  .editor-toolbar .spacer { flex: 1; }

  .editor-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .editor-body input,
  .editor-body textarea {
    width: 100%;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 6px;
    color: var(--vscode-input-foreground);
    padding: 10px 12px;
    font-family: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    resize: none;
  }
  .editor-body input:focus,
  .editor-body textarea:focus {
    border-color: var(--vscode-focusBorder);
  }
  .editor-body input {
    font-size: 15px;
    font-weight: 600;
  }
  .editor-body textarea {
    flex: 1;
    min-height: 150px;
    line-height: 1.6;
  }

  .color-picker {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding: 4px 0;
  }
  .color-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }
  .color-dot:hover { transform: scale(1.15); }
  .color-dot.selected {
    border-color: var(--vscode-focusBorder);
    transform: scale(1.15);
  }
  .color-dot.selected::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--vscode-focusBorder);
  }

  .color-dot[data-color="default"] { background: var(--vscode-editor-background); border-color: var(--vscode-panel-border, rgba(128,128,128,0.3)); }
  .color-dot[data-color="coral"] { background: #f28b82; }
  .color-dot[data-color="peach"] { background: #fbbc04; }
  .color-dot[data-color="sand"] { background: #fff475; }
  .color-dot[data-color="mint"] { background: #ccff90; }
  .color-dot[data-color="sage"] { background: #a7ffeb; }
  .color-dot[data-color="fog"] { background: #cbf0f8; }
  .color-dot[data-color="storm"] { background: #aecbfa; }
  .color-dot[data-color="dusk"] { background: #d7aefb; }
  .color-dot[data-color="blossom"] { background: #fdcfe8; }
  .color-dot[data-color="clay"] { background: #e6c9a8; }
  .color-dot[data-color="chalk"] { background: #e8eaed; }
  .color-dot[data-color="default"].selected { border-color: var(--vscode-focusBorder); }

  .editor-footer {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.2));
  }
  .editor-footer .pin-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.3));
    color: var(--vscode-foreground);
    cursor: pointer;
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.15s;
  }
  .editor-footer .pin-toggle:hover { background: var(--vscode-toolbar-hoverBackground, rgba(128,128,128,0.15)); }
  .editor-footer .pin-toggle.active {
    background: var(--vscode-textLink-foreground);
    color: #fff;
    border-color: var(--vscode-textLink-foreground);
  }
  .editor-footer .spacer { flex: 1; }
  .editor-footer .btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: none;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-cancel {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }
  .btn-cancel:hover { background: var(--vscode-button-secondaryHoverBackground); }
  .btn-save {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }
  .btn-save:hover { background: var(--vscode-button-hoverBackground); }

  /* ── Confirm Dialog ── */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    animation: fadeIn 0.15s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .confirm-box {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.3));
    border-radius: 10px;
    padding: 20px;
    max-width: 260px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
  .confirm-box p { margin-bottom: 16px; font-size: 13px; line-height: 1.5; }
  .confirm-box .btns { display: flex; gap: 8px; justify-content: center; }
</style>
</head>
<body>

<!-- ── LIST VIEW ── -->
<div id="listView">
  <div class="header">
    <div class="search-box">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zm-.82 4.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04z"/>
      </svg>
      <input type="text" id="searchInput" placeholder="Search notes..." />
    </div>
    <button class="btn-new" id="btnNew">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1.5a.75.75 0 0 1 .75.75v5h5a.75.75 0 0 1 0 1.5h-5v5a.75.75 0 0 1-1.5 0v-5h-5a.75.75 0 0 1 0-1.5h5v-5A.75.75 0 0 1 8 1.5z"/>
      </svg>
      New Note
    </button>
  </div>
  <div class="notes-container" id="notesContainer"></div>
</div>

<!-- ── EDITOR VIEW ── -->
<div id="editorView" style="display:none">
  <div class="editor-overlay">
    <div class="editor-toolbar">
      <button class="back-btn" id="btnBack">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M7.78 1.97a.75.75 0 0 1 0 1.06L3.81 7h8.44a.75.75 0 0 1 0 1.5H3.81l3.97 3.97a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0z"/>
        </svg>
        Back
      </button>
      <div class="spacer"></div>
      <span id="editorLabel" style="font-size:11px;opacity:0.5"></span>
    </div>
    <div class="editor-body">
      <input type="text" id="edTitle" placeholder="Title" />
      <textarea id="edContent" placeholder="Write your note..."></textarea>
      <div class="color-picker" id="colorPicker"></div>
    </div>
    <div class="editor-footer">
      <button class="pin-toggle" id="btnPin">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1-.707.708l-.565-.566-2.475 2.475a3 3 0 0 1-.126 3.59l-.05.06-.036.043-4.95-4.95.043-.037.06-.05a3 3 0 0 1 3.59-.125L12.39 4.5l-.566-.566a.5.5 0 0 1 .146-.708L9.828.722zM2.5 13.5l4-4 1 1-4 4-1.5.5.5-1.5z"/>
        </svg>
        Pin
      </button>
      <div class="spacer"></div>
      <button class="btn btn-cancel" id="btnCancel">Cancel</button>
      <button class="btn btn-save" id="btnSave">Save</button>
    </div>
  </div>
</div>

<script>
(function() {
  const vscode = acquireVsCodeApi();
  const COLORS = ['default','coral','peach','sand','mint','sage','fog','storm','dusk','blossom','clay','chalk'];

  let notes = [];
  let searchQuery = '';
  let editingNote = null; // null = new, object = existing

  // ── Elements ──
  const listView = document.getElementById('listView');
  const editorView = document.getElementById('editorView');
  const searchInput = document.getElementById('searchInput');
  const notesContainer = document.getElementById('notesContainer');
  const btnNew = document.getElementById('btnNew');
  const btnBack = document.getElementById('btnBack');
  const btnPin = document.getElementById('btnPin');
  const btnCancel = document.getElementById('btnCancel');
  const btnSave = document.getElementById('btnSave');
  const edTitle = document.getElementById('edTitle');
  const edContent = document.getElementById('edContent');
  const colorPicker = document.getElementById('colorPicker');
  const editorLabel = document.getElementById('editorLabel');

  let selectedColor = 'default';
  let isPinned = false;

  // ── Init ──
  vscode.postMessage({ type: 'getNotes' });
  buildColorPicker();

  // ── Message handler ──
  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.type === 'notesData') {
      notes = msg.notes;
      renderList();
    } else if (msg.type === 'triggerNewNote') {
      openEditor(null);
    }
  });

  // ── Search ──
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase().trim();
    renderList();
  });

  // ── New note ──
  btnNew.addEventListener('click', () => openEditor(null));

  // ── Editor controls ──
  btnBack.addEventListener('click', closeEditor);
  btnCancel.addEventListener('click', closeEditor);
  btnSave.addEventListener('click', saveNote);
  btnPin.addEventListener('click', () => {
    isPinned = !isPinned;
    btnPin.classList.toggle('active', isPinned);
  });

  // ── Keyboard shortcut ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editorView.style.display !== 'none') {
      closeEditor();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && editorView.style.display !== 'none') {
      e.preventDefault();
      saveNote();
    }
  });

  // ── Color Picker ──
  function buildColorPicker() {
    colorPicker.innerHTML = '';
    COLORS.forEach(c => {
      const dot = document.createElement('div');
      dot.className = 'color-dot' + (c === selectedColor ? ' selected' : '');
      dot.dataset.color = c;
      dot.title = c === 'default' ? 'No color' : c.charAt(0).toUpperCase() + c.slice(1);
      dot.addEventListener('click', () => {
        selectedColor = c;
        colorPicker.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
      });
      colorPicker.appendChild(dot);
    });
  }

  // ── Render ──
  function renderList() {
    let filtered = notes;
    if (searchQuery) {
      filtered = notes.filter(n =>
        (n.title || '').toLowerCase().includes(searchQuery) ||
        (n.content || '').toLowerCase().includes(searchQuery)
      );
    }

    const pinned = filtered.filter(n => n.pinned);
    const others = filtered.filter(n => !n.pinned);

    if (filtered.length === 0) {
      notesContainer.innerHTML = renderEmpty();
      return;
    }

    let html = '';
    if (pinned.length > 0) {
      html += '<div class="section-label">Pinned</div>';
      pinned.forEach(n => html += renderCard(n));
    }
    if (others.length > 0) {
      if (pinned.length > 0) html += '<div class="section-label">Others</div>';
      others.forEach(n => html += renderCard(n));
    }

    notesContainer.innerHTML = html;

    // Attach click handlers
    notesContainer.querySelectorAll('.note-card').forEach(card => {
      const id = card.dataset.id;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn')) return;
        const note = notes.find(n => n.id === id);
        if (note) openEditor(note);
      });
    });

    notesContainer.querySelectorAll('.btn-pin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const note = notes.find(n => n.id === id);
        if (note) {
          vscode.postMessage({ type: 'updateNote', id, updates: { pinned: !note.pinned } });
        }
      });
    });

    notesContainer.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirm(btn.dataset.id);
      });
    });
  }

  function renderCard(note) {
    const title = note.title || 'Untitled';
    const titleClass = note.title ? '' : ' untitled';
    const date = formatDate(note.updatedAt || note.createdAt);
    const content = (note.content || '').substring(0, 200);
    const pinSvg = note.pinned
      ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1-.707.708l-.565-.566-2.475 2.475a3 3 0 0 1-.126 3.59l-.05.06-.036.043-4.95-4.95.043-.037.06-.05a3 3 0 0 1 3.59-.125L12.39 4.5l-.566-.566a.5.5 0 0 1 .146-.708L9.828.722zM2.5 13.5l4-4 1 1-4 4-1.5.5.5-1.5z"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.4"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1-.707.708l-.565-.566-2.475 2.475a3 3 0 0 1-.126 3.59l-.05.06-.036.043-4.95-4.95.043-.037.06-.05a3 3 0 0 1 3.59-.125L12.39 4.5l-.566-.566a.5.5 0 0 1 .146-.708L9.828.722zM2.5 13.5l4-4 1 1-4 4-1.5.5.5-1.5z"/></svg>';

    return \`
      <div class="note-card" data-id="\${note.id}" data-color="\${note.color || 'default'}">
        <div class="card-header">
          <div class="card-title\${titleClass}">\${escapeHtml(title)}</div>
        </div>
        \${content ? \`<div class="card-content">\${escapeHtml(content)}</div>\` : ''}
        <div class="card-footer">
          <span class="card-date">\${date}</span>
          <div class="card-actions">
            <button class="icon-btn btn-pin\${note.pinned ? ' pinned' : ''}" data-id="\${note.id}" title="Pin">
              \${pinSvg}
            </button>
            <button class="icon-btn btn-delete" data-id="\${note.id}" title="Delete">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm-7.5-2A1.5 1.5 0 0 1 4.5 2h7A1.5 1.5 0 0 1 13 3.5V4h1.5a.5.5 0 0 1 0 1H14v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5h-.5a.5.5 0 0 1 0-1H3v-.5zM4.5 3a.5.5 0 0 0-.5.5V4h8v-.5a.5.5 0 0 0-.5-.5h-7zM3 5v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5H3z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>\`;
  }

  function renderEmpty() {
    if (searchQuery) {
      return \`<div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zm-.82 4.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04z"/></svg>
        <p>No notes matching<br/>"<strong>\${escapeHtml(searchQuery)}</strong>"</p>
      </div>\`;
    }
    return \`<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.75C2 2.784 2.784 2 3.75 2h8.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25h-8.5zM5 6.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 6.25zm.75 2.25a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5z"/></svg>
      <p>No notes yet.<br/>Click <strong>"New Note"</strong> to get started!</p>
    </div>\`;
  }

  // ── Editor ──
  function openEditor(note) {
    editingNote = note;
    edTitle.value = note ? note.title : '';
    edContent.value = note ? note.content : '';
    selectedColor = note ? (note.color || 'default') : 'default';
    isPinned = note ? !!note.pinned : false;
    editorLabel.textContent = note ? 'Editing' : 'New Note';

    btnPin.classList.toggle('active', isPinned);
    buildColorPicker();

    listView.style.display = 'none';
    editorView.style.display = 'block';
    edTitle.focus();
  }

  function closeEditor() {
    editorView.style.display = 'none';
    listView.style.display = 'block';
  }

  function saveNote() {
    const title = edTitle.value.trim();
    const content = edContent.value.trim();

    if (!title && !content) {
      closeEditor();
      return;
    }

    if (editingNote) {
      vscode.postMessage({
        type: 'updateNote',
        id: editingNote.id,
        updates: { title, content, color: selectedColor, pinned: isPinned }
      });
    } else {
      vscode.postMessage({
        type: 'addNote',
        note: { title, content, color: selectedColor, pinned: isPinned }
      });
    }
    closeEditor();
  }

  // ── Confirm Delete ──
  function showConfirm(noteId) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = \`
      <div class="confirm-box">
        <p>Delete this note?</p>
        <div class="btns">
          <button class="btn btn-cancel" id="confirmNo">Cancel</button>
          <button class="btn btn-save" style="background:#f28b82;color:#000" id="confirmYes">Delete</button>
        </div>
      </div>\`;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirmNo').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#confirmYes').addEventListener('click', () => {
      vscode.postMessage({ type: 'deleteNote', id: noteId });
      overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ── Helpers ──
  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }

  function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }
})();
</script>
</body>
</html>`;
  }
}

module.exports = SidebarProvider;
