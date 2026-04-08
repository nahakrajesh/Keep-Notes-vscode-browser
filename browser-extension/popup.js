const API_URL = 'http://127.0.0.1:52437';
const COLORS = [
  'default', 'coral', 'peach', 'sand', 'mint', 'sage',
  'fog', 'storm', 'dusk', 'blossom', 'clay', 'chalk',
];
const COLOR_HEX = {
  default: '#f3f4f6', coral: '#f28b82', peach: '#fbbc04', sand: '#fff475',
  mint: '#ccff90', sage: '#a7ffeb', fog: '#cbf0f8', storm: '#aecbfa',
  dusk: '#d7aefb', blossom: '#fdcfe8', clay: '#e6c9a8', chalk: '#e8eaed',
};

let selectedColor = 'default';

// ── Elements ──
const statusDot = document.querySelector('.status-dot');
const statusEl = document.getElementById('status');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const colorPicker = document.getElementById('colorPicker');
const pinCheck = document.getElementById('pinCheck');
const btnSave = document.getElementById('btnSave');
const toast = document.getElementById('toast');
const recentSection = document.getElementById('recentSection');
const recentList = document.getElementById('recentList');

// ── Init ──
buildColorPicker();
checkConnection();
loadRecent();
noteTitle.focus();

// ── Keyboard shortcut ──
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    saveNote();
  }
});

// ── Save ──
btnSave.addEventListener('click', saveNote);

async function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title && !content) {
    showToast('Please enter a title or content', 'error');
    return;
  }

  btnSave.disabled = true;
  btnSave.textContent = 'Saving...';

  try {
    const res = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        color: selectedColor,
        pinned: pinCheck.checked,
      }),
    });

    if (!res.ok) throw new Error('Failed to save');

    showToast('Note saved!', 'success');
    noteTitle.value = '';
    noteContent.value = '';
    pinCheck.checked = false;
    selectedColor = 'default';
    buildColorPicker();
    loadRecent();
  } catch (err) {
    showToast('Could not connect to VS Code. Is it running?', 'error');
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Save to Notepad`;
  }
}

// ── Connection check ──
async function checkConnection() {
  try {
    const res = await fetch(`${API_URL}/ping`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      statusDot.classList.add('connected');
      statusDot.classList.remove('disconnected');
      statusEl.title = 'Connected to VS Code';
    } else {
      throw new Error();
    }
  } catch {
    statusDot.classList.add('disconnected');
    statusDot.classList.remove('connected');
    statusEl.title = 'VS Code not running';
  }
}

// ── Load recent notes ──
async function loadRecent() {
  try {
    const res = await fetch(`${API_URL}/notes`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error();
    const notes = await res.json();

    if (notes.length === 0) {
      recentSection.style.display = 'none';
      return;
    }

    recentSection.style.display = 'block';
    recentList.innerHTML = '';

    notes.slice(0, 5).forEach((note) => {
      const el = document.createElement('div');
      el.className = 'recent-note';
      const colorHex = COLOR_HEX[note.color] || COLOR_HEX.default;
      const title = note.title || 'Untitled';
      const date = formatDate(note.updatedAt || note.createdAt);

      el.innerHTML = `
        <div class="color-bar" style="background:${colorHex}"></div>
        <div class="note-info">
          <div class="note-title">${escapeHtml(title)}</div>
          <div class="note-date">${date}</div>
        </div>`;

      recentList.appendChild(el);
    });
  } catch {
    recentSection.style.display = 'none';
  }
}

// ── Color Picker ──
function buildColorPicker() {
  colorPicker.innerHTML = '';
  COLORS.forEach((c) => {
    const dot = document.createElement('div');
    dot.className = 'color-dot' + (c === selectedColor ? ' selected' : '');
    dot.dataset.color = c;
    dot.title = c === 'default' ? 'No color' : c.charAt(0).toUpperCase() + c.slice(1);
    dot.addEventListener('click', () => {
      selectedColor = c;
      colorPicker.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('selected'));
      dot.classList.add('selected');
    });
    colorPicker.appendChild(dot);
  });
}

// ── Toast ──
function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}
