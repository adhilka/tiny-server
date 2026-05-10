import React, { useState, useRef } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Log {
  command: string;
  output: string;
  error?: string | null;
  time: string;
}

export default function Terminal() {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const executeCommand = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!command.trim() || loading) return;

    setLoading(true);
    const currentCmd = command;
    setCommand('');

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: currentCmd }),
      });
      const data = await res.json();
      
      const newLog = {
        command: currentCmd,
        output: data.output,
        error: data.error,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setLogs(prev => [newLog, ...prev]);
      
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[70vh] glass-card rounded-2xl overflow-hidden border border-zinc-800">
      <div className="bg-zinc-900/50 p-4 border-bottom border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">System Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLogs([])}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3 text-zinc-500" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[13px] scrollbar-hide flex flex-col-reverse"
      >
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1 group"
            >
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="text-[10px] opacity-50">[{log.time}]</span>
                <span className="text-emerald-500 font-bold">$</span>
                <span className="text-zinc-300">{log.command}</span>
              </div>
              {log.output && (
                <div className="pl-4 text-zinc-400 whitespace-pre-wrap py-1 border-l border-zinc-800 ml-1">
                  {log.output}
                </div>
              )}
              {log.error && (
                <div className="pl-4 text-red-500/80 italic leading-relaxed ml-1 border-l border-red-900/30">
                  {log.error}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
            No commands executed yet.
          </div>
        )}
      </div>

      <form 
        onSubmit={executeCommand}
        className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center gap-3"
      >
        <span className="text-emerald-500 font-bold">$</span>
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter shell command..."
          className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-600 font-mono text-sm"
        />
        <button 
          type="submit"
          disabled={loading || !command.trim()}
          className="p-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
        >
          {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
      </form>
    </div>
  );
}

import { AnimatePresence } from 'motion/react';
