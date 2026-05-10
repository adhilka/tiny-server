/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Terminal as TerminalIcon, 
  Folder, 
  Bot, 
  Settings as SettingsIcon, 
  Share2,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Terminal from './components/Terminal';
import AIManager from './components/AIManager';
import FileManager from './components/FileManager';
import AIChat from './components/AIChat';
import Settings from './components/Settings';

type View = 'dashboard' | 'terminal' | 'ai' | 'files' | 'chat' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavItem = ({ icon: Icon, label, view, color }: { icon: any, label: string, view: View, color: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsMenuOpen(false);
      }}
      className={`flex flex-col items-center gap-1.5 p-2 transition-all ${
        activeView === view ? color : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'scale-110' : ''}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {activeView === view && (
        <motion.div 
          layoutId="nav-glow"
          className={`absolute -bottom-1 w-1 h-1 rounded-full ${color.replace('text-', 'bg-')}`} 
        />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Server className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">OmniServer</span>
        </div>
        <button 
          onClick={() => setActiveView('chat')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
        >
          <Sparkles className="w-3 h-3" />
          Public Chat
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 pt-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'terminal' && <Terminal />}
            {activeView === 'ai' && <AIManager />}
            {activeView === 'files' && <FileManager />}
            {activeView === 'chat' && <AIChat />}
            {activeView === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md h-20 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-[32px] px-4 py-2 shadow-2xl flex items-center justify-between z-50">
        <NavItem icon={LayoutDashboard} label="Home" view="dashboard" color="text-indigo-400" />
        <NavItem icon={Bot} label="AI" view="ai" color="text-amber-400" />
        <NavItem icon={Folder} label="Files" view="files" color="text-blue-400" />
        <NavItem icon={TerminalIcon} label="Term" view="terminal" color="text-emerald-400" />
        <NavItem icon={SettingsIcon} label="Set" view="settings" color="text-zinc-400" />
      </nav>
    </div>
  );
}

import { Server } from 'lucide-react';

