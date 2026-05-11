import { useState, useEffect } from 'react';
import { Cpu, Activity, Globe, Link as LinkIcon, Shield, Bot, Terminal as TerminalIcon, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = () => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white tracking-tight">Active Session</h1>
          <p className="text-xs text-zinc-500 mt-1">Uptime: {Math.round(stats?.uptime || 0)}s • {stats?.platform || 'Process running'}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs font-medium">Tunnel</span>
        </button>
      </div>

      {/* Main Stats Segment */}
      <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 bg-zinc-950">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Memory</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-white">{stats?.memory?.usage || 0}</span>
            <span className="text-xs text-zinc-500">%</span>
          </div>
        </div>
        <div className="p-6 bg-zinc-950">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">CPU Threads</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-white">{stats?.cpus || 0}</span>
            <span className="text-xs text-zinc-500">Cores</span>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-2">Infrastructure</h3>
        <div className="divide-y divide-white/5">
          {[
            { label: 'Gateway Node', status: 'Healthy', icon: Shield },
            { label: 'AI Inference', status: 'Active', icon: Bot },
            { label: 'Static Hosting', status: 'Healthy', icon: Globe },
          ].map((svc, i) => (
            <div key={i} className="flex items-center justify-between py-4 group">
              <div className="flex items-center gap-4">
                <svc.icon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <span className="text-sm font-medium text-zinc-300">{svc.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{svc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Access */}
      {stats?.localIps?.length > 0 && (
        <div className="space-y-4 pt-10 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Network Access</h3>
          <div className="space-y-2">
            {stats.localIps.map((ip: string) => (
              <div key={ip} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                <code className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200">http://{ip}:3000</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(`http://${ip}:3000`)}
                  className="px-2.5 py-1.5 bg-zinc-800 rounded-lg text-[10px] text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all font-medium"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm p-6 bg-zinc-900 rounded-[32px] border border-white/5 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Generate Public Link</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Localhost.run', cmd: 'ssh -R 80:localhost:3000 localhost.run' },
                  { name: 'Pinggy.io', cmd: 'ssh -R 80:localhost:3000 a.pinggy.io' },
                ].map((tunnel) => (
                  <button 
                    key={tunnel.name}
                    onClick={() => {
                        navigator.clipboard.writeText(tunnel.cmd);
                        setIsModalOpen(false);
                    }}
                    className="w-full p-4 bg-zinc-950 rounded-xl text-left border border-white/5 hover:border-zinc-700 transition-all"
                  >
                    <p className="text-xs font-semibold text-zinc-300 mb-1">{tunnel.name}</p>
                    <code className="text-[10px] font-mono text-indigo-400">{tunnel.cmd}</code>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
