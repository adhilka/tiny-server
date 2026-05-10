import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [model, setModel] = useState('llama3.2:1b');
  const [models, setModels] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: input
        })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMsg]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines as Ollama sends one JSON object per line
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json && typeof json.response === 'string') {
              assistantMsg.content += json.response;
              setMessages(prev => {
                const next = [...prev];
                const last = { ...next[next.length - 1] };
                last.content = assistantMsg.content;
                next[next.length - 1] = last;
                return next;
              });
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', line);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error. Is Ollama running?' }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] glass-card rounded-3xl overflow-hidden border border-zinc-800">
      <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Live AI Chat</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Public Endpoint</p>
          </div>
        </div>
        <select 
          value={model} 
          onChange={(e) => setModel(e.target.value)}
          className="bg-zinc-800 border-none rounded-lg text-[11px] px-2 py-1 text-zinc-300 font-mono outline-none"
        >
          {models.length > 0 ? models.map(m => (
            <option key={m.name} value={m.name}>{m.name}</option>
          )) : (
            <option value="llama3.2:1b">llama3.2:1b</option>
          )}
        </select>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'user' ? 'bg-zinc-800' : 'bg-emerald-500/10'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
              msg.role === 'user' ? 'bg-zinc-100 text-zinc-900 rounded-tr-none' : 'glass-card text-zinc-300 rounded-tl-none'
            }`}>
              {msg.content || (streaming && msg.role === 'assistant' ? <Loader2 className="w-4 h-4 animate-spin opacity-50" /> : '')}
            </div>
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
            <Sparkles className="w-8 h-8 opacity-20" />
            <p className="text-sm font-medium opacity-50 italic">Start a conversation with the local host.</p>
          </div>
        )}
      </div>

      <form 
        onSubmit={sendMessage}
        className="p-4 border-t border-zinc-800 flex items-center gap-3"
      >
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/30 transition-colors"
        />
        <button 
          type="submit"
          disabled={!input.trim() || streaming}
          className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center hover:bg-white transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
