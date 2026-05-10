import React, { useState, useEffect } from 'react';
import { History, Shield, Info, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  time: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export default function LogBook() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-medium tracking-tight flex items-center gap-2 text-white">
            <History className="w-5 h-5 text-indigo-400" />
            System Log Book
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time Node Events</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.time + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-start gap-4 transition-colors hover:border-zinc-800"
            >
              <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                log.level === 'error' ? 'bg-red-500/10' : 
                log.level === 'warn' ? 'bg-amber-500/10' : 'bg-blue-500/10'
              }`}>
                {log.level === 'error' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : 
                 log.level === 'warn' ? <Info className="w-4 h-4 text-amber-500" /> : 
                 <Shield className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {log.time}
                  </span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    log.level === 'error' ? 'text-red-500 bg-red-500/5' : 
                    log.level === 'warn' ? 'text-amber-500 bg-amber-500/5' : 'text-blue-500 bg-blue-500/5'
                  }`}>
                    {log.level}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed truncate">{log.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[32px]">
            <History className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
            <p className="text-sm text-zinc-600 font-medium">No system logs recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
