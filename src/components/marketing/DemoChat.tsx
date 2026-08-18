import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SCRIPTED_RESPONSES: Record<string, string> = {
  greeting: "Hello! I'm Aria, your AI receptionist. I can answer questions about services, book appointments, and capture your details — 24/7, in any language. What can I help you with today?",
  pricing: "Our plans start at $49/month for the Starter tier, which includes one AI agent and 500 conversations. The Pro plan at $149/month adds multi-language support and calendar booking. Would you like me to connect you with our team for a custom quote?",
  hours: "I'm available 24 hours a day, 7 days a week — I never sleep, take breaks, or miss a call. Your human team's hours are 9am–5pm, but I handle everything outside that window too.",
  services: "I can answer FAQs, qualify leads, book appointments directly into your calendar, capture contact information, send follow-up emails, and even handle phone calls when connected to Twilio. Think of me as a full-time receptionist at a fraction of the cost.",
  book: "I'd be happy to book an appointment! I can see your team's calendar availability in real-time. Could you share your preferred date and time, and I'll find the nearest open slot and add it to the calendar.",
  default: "Great question! I'm a demo of THE 7 WORKFORCE AI receptionist. In a live deployment, I'd be connected to this business's knowledge base and could give you specific, accurate answers. Would you like to see how I handle appointment booking or lead capture?",
};

function getScriptedReply(input: string): string {
  const lower = input.toLowerCase();
  if (/price|cost|plan|pricing|how much/.test(lower)) return SCRIPTED_RESPONSES.pricing;
  if (/hour|open|close|available|when/.test(lower)) return SCRIPTED_RESPONSES.hours;
  if (/service|do|feature|capab|help/.test(lower)) return SCRIPTED_RESPONSES.services;
  if (/book|appointment|schedule|meeting/.test(lower)) return SCRIPTED_RESPONSES.book;
  return SCRIPTED_RESPONSES.default;
}

export default function DemoChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: SCRIPTED_RESPONSES.greeting },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setTyping(true);

    let reply = SCRIPTED_RESPONSES.default;
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: text, demo: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reply && typeof data.reply === 'string') reply = data.reply;
      }
    } catch {
      // fall back to scripted
    }

    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 500);
  };

  const quickPrompts = ['What services do you offer?', 'How much does it cost?', 'Book an appointment'];

  return (
    <div className="glass rounded-2xl border border-white/10 bg-navy-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
            <Bot className="h-5 w-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy-900 bg-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Aria — AI Receptionist</p>
          <p className="text-xs text-emerald-400">Online · responds instantly</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gold-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-300">
          <Sparkles className="h-3 w-3" /> Live Demo
        </span>
      </div>

      <div ref={scrollRef} className="h-80 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                m.role === 'user' ? 'bg-white/10 text-white' : 'bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950'
              }`}
            >
              {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gold-400/15 text-white'
                  : 'bg-white/[0.04] text-gray-100'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-white/[0.04] px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-5 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-300 transition hover:border-gold-400/40 hover:text-gold-300"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-gold-400/50 focus:bg-white/[0.06]"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
