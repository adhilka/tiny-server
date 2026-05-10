import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Zap, Globe, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [hostName, setHostName] = useState('OmniServer-Node-01');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-1">
        <h2 className="text-xl font-medium tracking-tight flex items-center gap-2 text-white">
          <SettingsIcon className="w-5 h-5 text-zinc-400" />
          System Settings
        </h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Configuration & Identity</p>
      </div>

      <div className="space-y-4">
        {/* Device Identity */}
        <div className="p-6 rounded-[32px] glass-card border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Device Identity</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Local Node Name</p>
            </div>
          </div>
          
          <input 
            type="text" 
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-amber-500/30 transition-colors"
          />
        </div>

        {/* Network Visibility */}
        <div className="p-6 rounded-[32px] glass-card border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Public Tunnel</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Global Link Status</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${isPublic ? 'bg-indigo-500' : 'bg-zinc-800'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Security */}
        <div className="p-6 rounded-[32px] glass-card border border-zinc-800 space-y-4 opacity-50 grayscale pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Auth & Lock</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="p-6 rounded-[32px] glass-card border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Storage Cleanup</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Clear Uploads Cache</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors">
            Wipe Temporary Files
          </button>
        </div>
      </div>

      <div className="text-center p-8">
        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">OmniServer v1.0.4 - Pro Edition</p>
      </div>
    </div>
  );
}
