const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const NOTES_DIR = path.join(os.homedir(), '.vscode-notepad');
const NOTES_FILE = path.join(NOTES_DIR, 'notes.json');

class NotesManager {
  constructor() {
    this._ensureStorage();
  }

  _ensureStorage() {
    if (!fs.existsSync(NOTES_DIR)) {
      fs.mkdirSync(NOTES_DIR, { recursive: true });
    }
    if (!fs.existsSync(NOTES_FILE)) {
      fs.writeFileSync(NOTES_FILE, JSON.stringify({ notes: [] }, null, 2));
    }
  }

  getAllNotes() {
    this._ensureStorage();
    try {
      const data = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
      return data.notes || [];
    } catch {
      return [];
    }
  }

  addNote({ title, content, color, pinned }) {
    const notes = this.getAllNotes();
    const now = new Date().toISOString();
    const newNote = {
      id: crypto.randomUUID(),
      title: title || '',
      content: content || '',
      color: color || 'default',
      pinned: pinned || false,
      createdAt: now,
      updatedAt: now,
    };
    notes.unshift(newNote);
    this._save(notes);
    return newNote;
  }

  updateNote(id, updates) {
    const notes = this.getAllNotes();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    notes[idx] = {
      ...notes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this._save(notes);
    return notes[idx];
  }

  deleteNote(id) {
    const notes = this.getAllNotes().filter((n) => n.id !== id);
    this._save(notes);
  }

  _save(notes) {
    this._ensureStorage();
    fs.writeFileSync(NOTES_FILE, JSON.stringify({ notes }, null, 2));
  }
}

module.exports = NotesManager;
