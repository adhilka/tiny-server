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
  Server,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Terminal from './components/Terminal';
import FileManager from './components/FileManager';
import AIChat from './components/AIChat';
import Settings from './components/Settings';
import LogBook from './components/LogBook';

type View = 'dashboard' | 'terminal' | 'files' | 'chat' | 'settings' | 'logs';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const NavItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: View }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 transition-all rounded-xl flex items-center gap-2 ${
        activeView === view 
          ? 'bg-white text-zinc-950 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px] uppercase tracking-widest hidden md:block">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-200 antialiased selection:bg-white selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-white" />
          <span className="text-lg font-medium tracking-tight text-white italic">OmniServer</span>
        </div>
        <button 
          onClick={() => setActiveView('logs')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
            activeView === 'logs' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Events</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 py-12 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'terminal' && <Terminal />}
            {activeView === 'files' && <FileManager />}
            {activeView === 'chat' && <AIChat />}
            {activeView === 'settings' && <Settings />}
            {activeView === 'logs' && <LogBook />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-fit px-2 py-2 bg-zinc-900/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-1 z-50">
        <NavItem icon={LayoutDashboard} label="Home" view="dashboard" />
        <NavItem icon={Bot} label="AI" view="chat" />
        <NavItem icon={TerminalIcon} label="CMD" view="terminal" />
        <NavItem icon={Folder} label="Files" view="files" />
        <NavItem icon={SettingsIcon} label="System" view="settings" />
      </nav>
    </div>
  );
}

