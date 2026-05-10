import React, { useState, useEffect } from 'react';
import { Bot, Download, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COMMON_MODELS = [
  { name: 'llama3.2:1b', size: '1.3GB', description: 'Very fast, mobile-friendly', tag: 'Smallest' },
  { name: 'qwen2.5:0.5b', size: '350MB', description: 'Ultra-lightweight', tag: 'Tiny' },
  { name: 'phi3:mini', size: '2.3GB', description: 'Powerful for its size', tag: 'Balanced' },
  { name: 'tinyllama', size: '637MB', description: 'Legendary efficiency', tag: 'Fast' },
  { name: 'gemma2:2b', size: '1.6GB', description: 'Google quality, local scale', tag: 'Recommended' },
];

export default function AIManager() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data.models || []);
      setError(null);
    } catch (err) {
      setError('Ollama not connected. Pulling local models may fail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const pullModel = async (name: string) => {
    setPulling(name);
    try {
      const res = await fetch('/api/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      const reader = res.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Optionally parse progress here
      }
      
      await fetchModels();
    } catch (err) {
      console.error(err);
    } finally {
      setPulling(null);
    }
  };

  const isInstalled = (name: string) => {
    return models.some(m => m.name === name || m.name.startsWith(name));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          AI Models
        </h2>
        <button 
          onClick={() => fetchModels()}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {COMMON_MODELS.map((model) => (
          <motion.div 
            key={model.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl glass-card border border-zinc-800 flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-zinc-100">{model.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{model.tag}</span>
              </div>
              <p className="text-xs text-zinc-500">{model.description} • {model.size}</p>
            </div>

            <div className="flex items-center gap-2">
              {isInstalled(model.name) ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Installed
                </div>
              ) : (
                <button
                  disabled={!!pulling}
                  onClick={() => pullModel(model.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold hover:bg-white transition-colors disabled:opacity-50"
                >
                  {pulling === model.name ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  {pulling === model.name ? 'Downloading...' : 'Install'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {models.length > 0 && (
        <div className="pt-4 border-t border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">All Installed Models</h3>
          <div className="flex flex-wrap gap-2">
            {models.map(m => (
              <div key={m.digest} className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono whitespace-nowrap">
                {m.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
