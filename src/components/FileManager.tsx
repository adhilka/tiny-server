import React, { useState, useEffect } from 'react';
import { Folder, Upload, Download, FileText, Trash2, Search, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface FileItem {
  name: string;
  size: number;
  updatedAt: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
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
      console.error(err);
    } finally {
      setUploading(false);
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
        <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-400" />
          File Sharing
        </h2>
        <label className="cursor-pointer group flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
          {uploading ? (
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </>
          )}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search files..."
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
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-100 truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{formatSize(file.size)}</p>
              </div>
            </div>
            
            <a 
              href={`/api/download/${encodeURIComponent(file.name)}`}
              className="p-2 opacity-0 group-hover:opacity-100 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
            >
              <Download className="w-4 h-4 text-zinc-300" />
            </a>
          </motion.div>
        ))}
        
        {filteredFiles.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
            <Folder className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-600 font-medium">No files found in the server.</p>
          </div>
        )}
      </div>
    </div>
  );
}
