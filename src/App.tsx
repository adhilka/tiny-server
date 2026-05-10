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
import LogBook from './components/LogBook';

type View = 'dashboard' | 'terminal' | 'ai' | 'files' | 'chat' | 'settings' | 'logs';

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
            {activeView === 'logs' && <LogBook />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-zinc-900/95 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around z-50 overflow-hidden">
        <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" color="text-zinc-200" />
        <NavItem icon={Bot} label="AI Chat" view="chat" color="text-emerald-400" />
        <NavItem icon={TerminalIcon} label="CMD" view="terminal" color="text-rose-400" />
        <NavItem icon={Folder} label="Files" view="files" color="text-amber-400" />
        <NavItem icon={SettingsIcon} label="System" view="settings" color="text-indigo-400" />
      </nav>
    </div>
  );
}

import { Server, History } from 'lucide-react';

