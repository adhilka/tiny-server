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
    <div className="flex flex-col h-[600px] max-h-[85vh]">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h2 className="text-xl font-medium text-white tracking-tight">Terminal</h2>
          <p className="text-xs text-zinc-500 mt-1">Direct system access</p>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="text-xs font-medium text-zinc-500 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-8 space-y-6 font-mono text-[13px] flex flex-col-reverse"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 font-bold tracking-tighter">{log.time}</span>
                <span className="text-indigo-400 font-bold">»</span>
                <span className="text-zinc-300 font-medium">{log.command}</span>
              </div>
              {log.output && (
                <div className="pl-14 text-zinc-500 whitespace-pre-wrap leading-relaxed">
                  {log.output}
                </div>
              )}
              {log.error && (
                <div className="pl-14 text-rose-500/80 italic">
                  {log.error}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
            <TerminalIcon className="w-12 h-12 opacity-5" />
            <p className="text-xs font-medium tracking-wide border border-white/5 px-3 py-1 rounded-full opacity-30 uppercase">Read Only Active</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-white/5">
        <form 
          onSubmit={executeCommand}
          className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-zinc-700 transition-all"
        >
          <div className="pl-5 pr-3 text-zinc-600 font-bold">»</div>
          <input 
            type="text" 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Command line input..."
            className="w-full bg-transparent py-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-800 font-mono"
          />
          <button 
            type="submit"
            disabled={loading || !command.trim()}
            className="px-5 py-4 text-zinc-500 hover:text-white transition-colors"
          >
            {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
        </form>
      </div>
    </div>
  );
}

import { AnimatePresence } from 'motion/react';
