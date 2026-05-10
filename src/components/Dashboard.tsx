import { useState, useEffect } from 'react';
import { LayoutDashboard, Cpu, Network, Server, Activity, Globe, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
    
    // Use the current origin as the default public URL
    setPublicUrl(window.location.origin);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">OmniServer</h1>
        <p className="text-zinc-500 text-sm">System core active • {stats?.platform || "Unknown OS"}</p>
      </div>

      {/* Global Tunnel Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <Globe className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Tunneling</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              READY
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold">Access from Anywhere</h3>
            <p className="text-xs text-indigo-100 opacity-80 leading-relaxed">
              Run this command in your phone terminal to get a public URL accessible from any Wi-Fi or mobile data.
            </p>
          </div>

          <div className="p-3 bg-black/20 rounded-2xl flex items-center justify-between group">
            <code className="text-[10px] font-mono text-indigo-100 truncate">ssh -R 80:localhost:3000 a.pinggy.io</code>
            <button 
              onClick={() => navigator.clipboard.writeText('ssh -R 80:localhost:3000 a.pinggy.io')}
              className="text-[10px] font-bold uppercase tracking-widest p-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            >
              Copy
            </button>
          </div>
          
          <p className="text-[10px] text-indigo-200/60 font-medium italic">
            * No installation required. Just run in terminal and use the URL provided.
          </p>
        </div>
        <Globe className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
      </motion.div>

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

      {/* Resource Usage & Network Insights */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[32px] glass-card border border-zinc-800 space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Memory Usage</p>
            <div className="relative h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.memory?.usage || 0}%` }}
                className="absolute top-0 left-0 h-full bg-indigo-500"
              />
            </div>
            <p className="text-xl font-bold text-zinc-100">{stats?.memory?.usage || 0}%</p>
          </div>
          
          <div className="p-5 rounded-[32px] glass-card border border-zinc-800 space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CPU Threads</p>
            <p className="text-xl font-bold text-zinc-100">{stats?.cpus || 0} Cores</p>
            <p className="text-[10px] text-zinc-600 font-medium">Arch: {stats?.arch || 'n/a'}</p>
          </div>
        </div>

        {stats?.localIps?.length > 0 && (
          <div className="p-6 rounded-[32px] glass-card border border-zinc-900 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              Local Network Access
            </h3>
            <div className="space-y-2">
              {stats.localIps.map((ip: string) => (
                <div key={ip} className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl border border-zinc-800/50 group">
                  <code className="text-xs font-mono text-zinc-300">http://{ip}:3000</code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`http://${ip}:3000`)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-200 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Copy
                  </button>
                </div>
              ))}
              <p className="text-[10px] text-zinc-600 italic px-1 pt-1 leading-relaxed">
                Connect via any device on your local Wi-Fi using these URLs.
              </p>
            </div>
          </div>
        )}
      </div>

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
