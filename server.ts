import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import os from 'os';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

// Global Log Storage
const systemLogs: { time: string; level: 'info' | 'warn' | 'error'; message: string }[] = [];

function addLog(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const log = { time: new Date().toLocaleTimeString(), level, message };
  systemLogs.unshift(log);
  if (systemLogs.length > 100) systemLogs.pop();
  console.log(`[${log.time}] [${level.toUpperCase()}] ${message}`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Setup storage for file sharing
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage });

  // API Routes
  app.get('/api/health', (req, res) => {
    addLog('System health check initiated');
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const k in interfaces) {
      const netInterface = interfaces[k];
      if (netInterface) {
        for (const address of netInterface) {
          if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
          }
        }
      }
    }

    res.json({ 
      status: 'running', 
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
        usage: Math.round((1 - (os.freemem() / os.totalmem())) * 100)
      },
      cpus: os.cpus().length,
      localIps: addresses
    });
  });

  app.get('/api/logs', (req, res) => {
    res.json(systemLogs);
  });

  // Ollama API Proxies
  app.get('/api/models', async (req, res) => {
    try {
      addLog('Scanning local AI models');
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      addLog('AI Engine unreachable', 'error');
      res.status(500).json({ error: 'Ollama not reachable. Ensure it is running on port 11434.' });
    }
  });

  app.post('/api/models/pull', async (req, res) => {
    const { name } = req.body;
    addLog(`Downloading AI Model: ${name}`);
    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      // Stream the response back
      response.body?.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        }
      }));
    } catch (error) {
      res.status(500).json({ error: 'Failed to pull model' });
    }
  });

  // AI Chat Proxy
  app.post('/api/ai/generate', async (req, res) => {
    const { model, prompt } = req.body;
    addLog(`AI Chat request [Model: ${model}]`);
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: true }),
      });

      if (!response.body) {
        return res.status(500).json({ error: 'No response body from Ollama' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: 'Ollama unreachable' });
    }
  });

  // Web Hosting Middleware
  app.use('/public', express.static(uploadsDir));

  // File Sharing API
  app.get('/api/files', (req, res) => {
    addLog('Scanning storage directory');
    const items = fs.readdirSync(uploadsDir).map(name => {
      const filePath = path.join(uploadsDir, name);
      const stats = fs.statSync(filePath);
      const isDirectory = stats.isDirectory();
      const ext = path.extname(name).toLowerCase();
      
      let hostUrl = `/public/${encodeURIComponent(name)}`;
      let isWebReady = false;

      if (isDirectory) {
        // Check for index.html in root or dist
        if (fs.existsSync(path.join(filePath, 'index.html'))) {
          isWebReady = true;
          hostUrl = `/public/${encodeURIComponent(name)}/index.html`;
        } else if (fs.existsSync(path.join(filePath, 'dist', 'index.html'))) {
          isWebReady = true;
          hostUrl = `/public/${encodeURIComponent(name)}/dist/index.html`;
        }
      } else {
        isWebReady = ['.html', '.htm'].includes(ext);
      }

      return {
        name,
        size: stats.size,
        updatedAt: stats.mtime,
        isDirectory,
        isWebReady,
        hostUrl
      };
    });
    res.json(items);
  });

  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    addLog(`File received: ${req.file.originalname}`);

    // Auto-extract zip files
    if (req.file.originalname.endsWith('.zip')) {
      try {
        addLog(`Extracting web archive: ${req.file.originalname}`);
        const zip = new AdmZip(req.file.path);
        const extractPath = path.join(uploadsDir, path.parse(req.file.originalname).name);
        zip.extractAllTo(extractPath, true);
        addLog(`Archive extracted to: ${extractPath}`);
        res.json({ message: 'Zip extracted and ready to host', path: extractPath });
      } catch (err) {
        addLog(`Extraction failed for ${req.file.originalname}`, 'error');
        res.status(500).json({ error: 'Failed to extract zip' });
      }
    } else {
      res.json({ message: 'File uploaded successfully', file: req.file });
    }
  });

  // Project Builder (Converts Vite/React)
  app.post('/api/hosting/build', (req, res) => {
    const { folderName } = req.body;
    const projectPath = path.join(uploadsDir, folderName);

    if (!fs.existsSync(projectPath)) return res.status(404).json({ error: 'Folder not found' });

    addLog(`Initiating build for ${folderName}`);

    // Check for package.json
    if (!fs.existsSync(path.join(projectPath, 'package.json'))) {
      addLog(`Build aborted: Missing package.json in ${folderName}`, 'warn');
      return res.status(400).json({ error: 'Not a Node.js/Vite project (no package.json found)' });
    }

    res.write(JSON.stringify({ status: 'Starting build...' }) + '\n');

    exec(`cd "${projectPath}" && npm install && npm run build`, (error, stdout, stderr) => {
      if (error) {
        addLog(`Build failed for ${folderName}`, 'error');
        res.write(JSON.stringify({ error: stderr || error.message }) + '\n');
        return res.end();
      }
      addLog(`Build successful: ${folderName}`);
      res.write(JSON.stringify({ status: 'Build complete!', output: stdout }) + '\n');
      res.end();
    });
  });

  app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      addLog(`File download: ${req.params.filename}`);
      res.download(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });

  // Terminal Simulation
  app.post('/api/terminal', (req, res) => {
    const { command } = req.body;
    addLog(`Executing terminal command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) addLog(`Command error: ${command}`, 'warn');
      res.json({
        output: stdout,
        error: stderr || (error ? error.message : null)
      });
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
