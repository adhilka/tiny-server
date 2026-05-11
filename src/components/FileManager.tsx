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
    <div className="space-y-10 pb-12">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h2 className="text-xl font-medium text-white tracking-tight">Active Files</h2>
          <p className="text-xs text-zinc-500 mt-1">Local distribution server</p>
        </div>
        <label className="cursor-pointer flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 rounded-xl text-xs font-semibold transition-all">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>{uploading ? 'Processing' : 'Deploy'}</span>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-zinc-400" />
        <input 
          type="text" 
          placeholder="Filter volumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-zinc-200 focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-800"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-2">File Topology</h3>
        <div className="divide-y divide-white/5">
          {filteredFiles.map((file) => (
            <motion.div 
              key={file.name}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between py-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="text-zinc-500 group-hover:text-zinc-200 transition-colors">
                  {file.isDirectory ? <Folder className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">{file.name}</span>
                    {file.isWebReady && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">Live</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                    {file.isDirectory ? 'Volume' : formatSize(file.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {file.isDirectory && !file.isWebReady && (
                  <button
                    onClick={() => runBuild(file.name)}
                    disabled={!!building}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {building === file.name ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Package className="w-4 h-4" />}
                  </button>
                )}
                {file.isWebReady && (
                  <a 
                    href={file.hostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {!file.isDirectory && (
                  <a 
                    href={`/api/download/${encodeURIComponent(file.name)}`}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredFiles.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">No Volumes Detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
