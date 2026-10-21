import express from 'express';
import { createServer as createViteServer } from 'vite';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize SQLite database
  const SQL = await initSqlJs();
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'settings.sqlite');
  let db: any;

  if (fs.existsSync(dbPath)) {
    try {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
      console.log('Loaded existing SQLite database from', dbPath);
    } catch (e) {
      console.error('Error reading sqlite file, recreating new database:', e);
      db = new SQL.Database();
    }
  } else {
    console.log('Creating fresh SQLite database at', dbPath);
    db = new SQL.Database();
  }

  // Persist DB state to disk
  const persistDb = () => {
    try {
      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
    } catch (err) {
      console.error('Failed to persist sqlite db:', err);
    }
  };

  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY,
      settings_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      config_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS media_blobs (
      id TEXT PRIMARY KEY,
      name TEXT,
      mime_type TEXT,
      base64_data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default preset if none exists
  try {
    const checkStmt = db.prepare('SELECT count(*) as count FROM presets');
    checkStmt.step();
    const count = checkStmt.getAsObject().count;
    checkStmt.free();
    if (count === 0) {
      const defaultPresetConfig = {
        name: 'TimePhoto Reference (Standard)',
        is_default: 1,
        config: {
          showCompass: true,
          showMap: true,
          showCoordinates: true,
          showAddress: true,
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          showDayName: false,
          nightMode: false,
          compassStyle: 'reference',
          mapZoom: 16,
        },
      };
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO presets (id, name, is_default, config_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'preset_reference',
          defaultPresetConfig.name,
          1,
          JSON.stringify(defaultPresetConfig.config),
          now,
          now,
        ]
      );
      persistDb();
    }
  } catch (err) {
    console.error('Error seeding initial preset:', err);
  }

  persistDb();

  // API Endpoints
  // 1. Settings Endpoints
  app.get('/api/settings', (req, res) => {
    try {
      const stmt = db.prepare('SELECT settings_json, updated_at FROM app_settings WHERE id = ?');
      stmt.bind(['default']);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return res.json({
          success: true,
          settings: JSON.parse(row.settings_json as string),
          updated_at: row.updated_at,
          source: 'sqlite',
        });
      }
      stmt.free();
      return res.json({ success: true, settings: null, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const { settings } = req.body;
      if (!settings) return res.status(400).json({ error: 'Missing settings payload' });
      const now = new Date().toISOString();
      const settingsStr = JSON.stringify(settings);

      db.run(
        'INSERT INTO app_settings (id, settings_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET settings_json = ?, updated_at = ?',
        ['default', settingsStr, now, settingsStr, now]
      );
      persistDb();
      return res.json({ success: true, updated_at: now, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Presets Endpoints
  app.get('/api/presets', (req, res) => {
    try {
      const stmt = db.prepare(
        'SELECT id, name, is_default, config_json, created_at, updated_at FROM presets ORDER BY is_default DESC, name ASC'
      );
      const presets: any[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        presets.push({
          id: row.id,
          name: row.name,
          is_default: Boolean(row.is_default),
          config: JSON.parse(row.config_json as string),
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }
      stmt.free();
      return res.json({ success: true, presets, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/presets', (req, res) => {
    try {
      const { id, name, is_default, config } = req.body;
      const presetId = id || 'preset_' + Date.now();
      const now = new Date().toISOString();
      const configStr = JSON.stringify(config || {});
      const isDef = is_default ? 1 : 0;

      if (isDef) {
        db.run('UPDATE presets SET is_default = 0');
      }

      db.run(
        'INSERT INTO presets (id, name, is_default, config_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = ?, is_default = ?, config_json = ?, updated_at = ?',
        [presetId, name, isDef, configStr, now, now, name, isDef, configStr, now]
      );
      persistDb();
      return res.json({ success: true, id: presetId, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/presets/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.run('DELETE FROM presets WHERE id = ?', [id]);
      persistDb();
      return res.json({ success: true, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Media Blobs / Logo Endpoints
  app.get('/api/logo', (req, res) => {
    try {
      const stmt = db.prepare('SELECT id, name, mime_type, base64_data, updated_at FROM media_blobs WHERE id = ?');
      stmt.bind(['active_logo']);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return res.json({ success: true, logo: row, source: 'sqlite' });
      }
      stmt.free();
      return res.json({ success: true, logo: null, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/logo', (req, res) => {
    try {
      const { base64_data, mime_type, name } = req.body;
      if (!base64_data) return res.status(400).json({ error: 'Missing base64_data' });
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO media_blobs (id, name, mime_type, base64_data, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = ?, mime_type = ?, base64_data = ?, updated_at = ?',
        [
          'active_logo',
          name || 'logo.png',
          mime_type || 'image/png',
          base64_data,
          now,
          name || 'logo.png',
          mime_type || 'image/png',
          base64_data,
          now,
        ]
      );
      persistDb();
      return res.json({ success: true, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/logo', (req, res) => {
    try {
      db.run('DELETE FROM media_blobs WHERE id = ?', ['active_logo']);
      persistDb();
      return res.json({ success: true, source: 'sqlite' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. SQLite Database Status & Download
  app.get('/api/database/info', (req, res) => {
    try {
      let sizeBytes = 0;
      let updatedAt = null;
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        sizeBytes = stats.size;
        updatedAt = stats.mtime.toISOString();
      }
      return res.json({
        success: true,
        engine: 'SQLite 3 (sql.js WASM)',
        path: 'data/settings.sqlite',
        sizeBytes,
        updatedAt,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/database/download', (req, res) => {
    try {
      if (fs.existsSync(dbPath)) {
        res.setHeader('Content-Type', 'application/x-sqlite3');
        res.setHeader('Content-Disposition', 'attachment; filename="settings.sqlite"');
        return res.sendFile(dbPath);
      }
      return res.status(404).send('Database file not found');
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  });

  // Mount Vite in dev mode or serve static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
