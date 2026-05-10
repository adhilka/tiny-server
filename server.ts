import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

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
    res.json({ status: 'running', platform: process.platform });
  });

  // Ollama API Proxies
  app.get('/api/models', async (req, res) => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ollama not reachable. Ensure it is running on port 11434.' });
    }
  });

  app.post('/api/models/pull', async (req, res) => {
    const { name } = req.body;
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

  // File Sharing API
  app.get('/api/files', (req, res) => {
    const files = fs.readdirSync(uploadsDir).map(file => {
      const stats = fs.statSync(path.join(uploadsDir, file));
      return {
        name: file,
        size: stats.size,
        updatedAt: stats.mtime
      };
    });
    res.json(files);
  });

  app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully', file: req.file });
  });

  app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });

  // Terminal Simulation / Command Execution
  app.post('/api/terminal', (req, res) => {
    const { command } = req.body;
    // VERY DANGEROUS - In a real app, you'd restrict this heavily.
    // For this prompt "turns device into server", it's implied.
    exec(command, (error, stdout, stderr) => {
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
