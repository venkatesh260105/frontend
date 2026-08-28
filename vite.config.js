import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Vite Plugin to automatically sync order & app data to src/storage.json on the hard disk
function storageFilePlugin() {
  return {
    name: 'storage-file-sync-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const storageFilePath = path.resolve(process.cwd(), 'src/storage.json');

        // Handle POST: Save live data to src/storage.json on disk
        if (req.url === '/api/save-storage' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Successfully written to src/storage.json' }));
            } catch (err) {
              console.error('Failed to write to src/storage.json:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Handle GET: Load data from src/storage.json on disk
        if (req.url === '/api/load-storage' && req.method === 'GET') {
          try {
            if (fs.existsSync(storageFilePath)) {
              const content = fs.readFileSync(storageFilePath, 'utf-8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(content);
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'src/storage.json not found' }));
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), storageFilePlugin()]
});
