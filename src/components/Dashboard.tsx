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
    <div className="space-y-6 pb-12 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">OmniServer</h1>
          <p className="text-sm text-zinc-500">System core active • {stats?.platform || "Unknown OS"}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900 rounded-xl space-y-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Memory</p>
          <p className="text-lg text-white">{stats?.memory?.usage || 0}%</p>
        </div>
        <div className="p-4 bg-zinc-900 rounded-xl space-y-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Threads</p>
          <p className="text-lg text-white">{stats?.cpus || 0}</p>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase">System Status</h3>
        <div className="space-y-2">
          {[
            { label: 'Gateway', status: 'Active', icon: Shield },
            { label: 'AI Engine', status: 'Connected', icon: Bot },
            { label: 'File Server', status: 'Healthy', icon: Globe },
          ].map((svc, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl">
              <div className="flex items-center gap-3">
                <svc.icon className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-200">{svc.label}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{svc.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Network Access */}
      <div className="p-4 bg-zinc-900 rounded-xl space-y-3">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase">Network Access</h3>
        {stats?.localIps?.map((ip: string) => (
          <div key={ip} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
            <code className="text-xs font-mono text-zinc-300">http://{ip}:3000</code>
            <button 
              onClick={() => navigator.clipboard.writeText(`http://${ip}:3000`)}
              className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400"
            >
              Copy
            </button>
          </div>
        ))}
      </div>

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
