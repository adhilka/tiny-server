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
    <div className="space-y-10 pb-12">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h2 className="text-xl font-medium text-white tracking-tight">System Events</h2>
          <p className="text-xs text-zinc-500 mt-1">Real-time node telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Live Feed</span>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.time + i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-6 group"
            >
              <div className="pt-1 flex flex-col items-center gap-2 w-12 flex-shrink-0">
                <span className="text-[10px] font-bold text-zinc-700 tracking-tighter">{log.time.split(' ')[0]}</span>
                <div className={`w-px h-full min-h-[20px] bg-white/5 group-last:hidden`} />
              </div>
              
              <div className="flex-1 space-y-1 pb-6 border-b border-white/5 group-last:border-none">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${
                    log.level === 'error' ? 'text-rose-500' : 
                    log.level === 'warn' ? 'text-amber-500' : 'text-zinc-500'
                  }`}>
                    {log.level}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-300 font-medium leading-relaxed">{log.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Zero Events Logged</p>
          </div>
        )}
      </div>
    </div>
  );
}
