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
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

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
    <div className="flex flex-col h-[600px] max-h-[85vh]">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h2 className="text-xl font-medium text-white tracking-tight">AI Assistant</h2>
          <p className="text-xs text-zinc-500 mt-1">Local Ollama Engine</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-600 uppercase">Model</span>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="bg-zinc-900 border border-white/5 rounded-lg text-xs px-3 py-1.5 text-zinc-300 outline-none focus:border-zinc-700 transition-colors"
          >
            {models.length > 0 ? models.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            )) : (
              <option value="llama3.2:1b">llama3.2:1b</option>
            )}
          </select>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-8 space-y-8 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{msg.role}</span>
            </div>
            <div className={`p-4 rounded-2xl text-[14px] leading-relaxed max-w-[90%] ${
              msg.role === 'user' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 border border-white/5 text-zinc-300'
            }`}>
              {msg.content || (streaming && msg.role === 'assistant' ? <Loader2 className="w-4 h-4 animate-spin opacity-50" /> : '')}
            </div>
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
            <Bot className="w-12 h-12 opacity-5" />
            <p className="text-xs font-medium tracking-wide uppercase opacity-30">Waiting for input</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-white/5">
        <form 
          onSubmit={sendMessage}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-700"
          />
          <button 
            type="submit"
            disabled={!input.trim() || streaming}
            className="absolute right-3 p-2 rounded-xl text-zinc-500 hover:text-white transition-colors disabled:opacity-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
