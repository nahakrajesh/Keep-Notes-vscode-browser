const vscode = require('vscode');
const http = require('http');
const NotesManager = require('./notesManager');
const SidebarProvider = require('./sidebarProvider');

let server;

function activate(context) {
  const notesManager = new NotesManager();
  const sidebarProvider = new SidebarProvider(context.extensionUri, notesManager);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'notepadKeeper.sidebar',
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('notepadKeeper.addNote', () => {
      sidebarProvider.addNewNote();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('notepadKeeper.refresh', () => {
      sidebarProvider.refresh();
    })
  );

  // HTTP server for the browser extension to send notes
  server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        if (req.method === 'POST' && req.url === '/notes') {
          const note = JSON.parse(body);
          const saved = notesManager.addNote(note);
          sidebarProvider.refresh();
          vscode.window.showInformationMessage(
            `Note saved: ${saved.title || 'Untitled'}`
          );
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(saved));
        } else if (req.method === 'GET' && req.url === '/notes') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(notesManager.getAllNotes()));
        } else if (req.method === 'GET' && req.url === '/ping') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      } catch (e) {
        res.writeHead(500);
        res.end('Internal error');
      }
    });
  });

  server.listen(52437, '127.0.0.1', () => {
    console.log('Notepad Keeper server running on port 52437');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      vscode.window.showWarningMessage(
        'Notepad Keeper: Port 52437 is in use. Browser sync disabled.'
      );
    }
  });
}

function deactivate() {
  if (server) {
    server.close();
  }
}

module.exports = { activate, deactivate };
