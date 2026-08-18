import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const careerCloudDbPlugin = () => ({
  name: 'career-cloud-db-plugin',
  configureServer(server) {
    const dbDir = path.resolve(process.cwd(), '.career_cloud_db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, 'http://localhost');
      
      // Match /api/cloud-db/users/:emailKey.json or /api/cloud-db/users/:emailKey
      if (url.pathname.startsWith('/api/cloud-db/users/')) {
        const rawKey = url.pathname.replace('/api/cloud-db/users/', '').replace(/\.json$/, '');
        const safeKey = decodeURIComponent(rawKey).toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.json';
        const filePath = path.join(dbDir, safeKey);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        if (req.method === 'GET') {
          if (fs.existsSync(filePath)) {
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              return res.end(content);
            } catch (e) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: e.message }));
            }
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'User not found' }));
          }
        }

        if (req.method === 'PUT' || req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              fs.writeFileSync(filePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, key: safeKey, updatedAt: Date.now() }));
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), careerCloudDbPlugin()],
  server: {
    host: true, // Allow iPad, mobile and other devices on same WiFi/network to connect
    port: 5173
  }
});
