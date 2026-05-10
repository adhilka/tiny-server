import React, { useState, useEffect } from 'react';
import { Folder, Upload, Download, FileText, Trash2, Search, Plus, ExternalLink, Globe, Package, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface FileItem {
  name: string;
  size: number;
  updatedAt: string;
  isDirectory?: boolean;
  isWebReady?: boolean;
  hostUrl?: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [building, setBuilding] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      fetchFiles();
    } catch (err) {
      alert('Upload or Extraction failed');
    } finally {
      setUploading(false);
    }
  };

  const runBuild = async (folderName: string) => {
    setBuilding(folderName);
    try {
      const res = await fetch('/api/hosting/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName }),
      });
      // Building might take a while, we'd ideally stream logs
      const data = await res.text();
      console.log(data);
      fetchFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setBuilding(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-medium tracking-tight flex items-center gap-2 text-white">
            <Folder className="w-5 h-5 text-blue-400" />
            File Storage
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Supports React/Vite Hosting</p>
        </div>
        <label className="cursor-pointer group flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
          {uploading ? (
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Site</span>
            </>
          )}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-blue-500/50 outline-none transition-colors"
        />
      </div>

      <div className="grid gap-2">
        {filteredFiles.map((file, i) => (
          <motion.div 
            key={file.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 hover:bg-zinc-900/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${file.isDirectory ? 'bg-amber-500/10 border-amber-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                {file.isDirectory ? (
                  <Folder className="w-5 h-5 text-amber-400" />
                ) : (
                  <FileText className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-100 truncate max-w-[120px] sm:max-w-xs">{file.name}</p>
                  {file.isWebReady && (
                    <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-[8px] font-bold text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">Live</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {file.isDirectory ? 'Directory' : formatSize(file.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {file.isDirectory && !file.isWebReady && (
                <button
                  onClick={() => runBuild(file.name)}
                  disabled={!!building}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-all text-amber-400"
                  title="Build Vite Project"
                >
                  {building === file.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                </button>
              )}
              {file.isWebReady && (
                <a 
                  href={file.hostUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all"
                  title="Open Web Page"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                </a>
              )}
              {!file.isDirectory && (
                <a 
                  href={`/api/download/${encodeURIComponent(file.name)}`}
                  className="p-2 opacity-0 group-hover:opacity-100 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-zinc-300" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
        
        {filteredFiles.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
            <Folder className="w-8 h-8 text-zinc-700 mx-auto mb-1" />
            <p className="text-sm text-zinc-600 font-medium">Empty Storage</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Upload folders or zip files</p>
          </div>
        )}
      </div>

      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <Globe className="w-3 h-3" />
          Pro Hosting Guide
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload a <code className="text-indigo-400">.zip</code> of your Vite/React project.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              OmniServer extracts it. Click the <Package className="inline w-3 h-3 text-amber-400" /> icon to run <code className="text-zinc-300">npm install && build</code>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Once the <code className="text-emerald-500">LIVE</code> badge appears, your app is hosted at your public URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
