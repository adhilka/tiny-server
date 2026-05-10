import { useState, useEffect } from 'react';
import { LayoutDashboard, Cpu, Network, Server, Activity, Globe, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const publicUrl = window.location.href;

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">OmniServer</h1>
        <p className="text-zinc-500 text-sm">System core active • {stats?.platform || 'Unknown OS'}</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl glass-card space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Engine</p>
            <p className="text-lg font-semibold text-zinc-100">Ollama</p>
          </div>
        </div>
        <div className="p-4 rounded-3xl glass-card space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</p>
            <p className="text-lg font-semibold text-zinc-100">Online</p>
          </div>
        </div>
      </div>

      {/* Public Link Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-[32px] bg-indigo-500 text-white space-y-4 shadow-xl shadow-indigo-500/20 overflow-hidden relative"
      >
        <Globe className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20">Public Access</span>
            </div>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 hover:scale-110 transition-transform" />
            </a>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Host your AI Cloud</h3>
            <p className="text-xs text-indigo-100 opacity-80 leading-relaxed">Anyone can use your local AI through this link when your server is running.</p>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl flex items-center justify-between">
            <code className="text-[11px] font-mono truncate mr-2">{publicUrl}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="text-[10px] font-bold uppercase tracking-widest hover:underline"
            >
              Copy
            </button>
          </div>
        </div>
      </motion.div>

      {/* Node Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Live Node Activity</h3>
        <div className="space-y-2">
          {['HTTPS Gateway Active', 'Local API listening on 3000', 'Ollama Bridge Connected'].map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-zinc-400 px-4 py-3 rounded-2xl border border-zinc-800/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
