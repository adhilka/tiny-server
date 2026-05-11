import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Zap, Globe, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [hostName, setHostName] = useState('OmniServer-Node-01');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="space-y-10 pb-12">
      <div className="pb-6 border-b border-white/5">
        <h2 className="text-xl font-medium text-white tracking-tight">System Settings</h2>
        <p className="text-xs text-zinc-500 mt-1">Global node configuration</p>
      </div>

      <div className="space-y-12">
        {/* Device Identity */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Identity</h3>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Node Name</label>
            <input 
              type="text" 
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 outline-none focus:border-zinc-700 transition-all"
            />
          </div>
        </div>

        {/* Network Visibility */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Network</h3>
          <div className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-medium text-zinc-200">Public Visibility</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Allow global tunnel bridging</p>
            </div>
            <button 
              onClick={() => setIsPublic(!isPublic)}
              className={`w-10 h-5 rounded-full p-1 transition-colors ${isPublic ? 'bg-zinc-100' : 'bg-zinc-800'}`}
            >
              <div className={`w-3 h-3 rounded-full transition-transform ${isPublic ? 'translate-x-5 bg-zinc-950' : 'translate-x-0 bg-zinc-500'}`} />
            </button>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Maintenance</h3>
          <button className="w-full py-4 rounded-2xl border border-white/5 bg-zinc-900/30 text-zinc-400 text-xs font-semibold hover:text-white hover:bg-zinc-800 transition-all">
            Wipe Cache Volumes
          </button>
        </div>
      </div>

      <div className="pt-20 text-center opacity-20">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">OmniServer Architecture 1.0.4</p>
      </div>
    </div>
  );
}
