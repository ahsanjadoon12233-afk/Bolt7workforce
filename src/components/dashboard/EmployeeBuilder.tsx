import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Sparkles, Mic, BookOpen, Plug, Workflow as WorkflowIcon, Clock,
  AlertTriangle, PlayCircle, Rocket, Check, ChevronRight, ChevronLeft,
  Volume2, Save,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Identity', icon: Bot, desc: 'Name, nickname, role, avatar' },
  { id: 2, label: 'Personality', icon: Sparkles, desc: 'Tone, warmth, professionalism, energy' },
  { id: 3, label: 'Voice', icon: Mic, desc: 'Provider, voice, accent, language' },
  { id: 4, label: 'Knowledge', icon: BookOpen, desc: 'FAQs, services, pricing, policies' },
  { id: 5, label: 'Tools', icon: Plug, desc: 'Calendar, CRM, email, SMS, payments' },
  { id: 6, label: 'Workflows', icon: WorkflowIcon, desc: 'Booking, lead capture, follow-up, escalation' },
  { id: 7, label: 'Working Hours', icon: Clock, desc: 'Business hours, after-hours, holidays' },
  { id: 8, label: 'Escalation', icon: AlertTriangle, desc: 'Human transfer, callback, tickets' },
  { id: 9, label: 'Test', icon: PlayCircle, desc: 'Interactive AI testing environment' },
  { id: 10, label: 'Launch', icon: Rocket, desc: 'Production readiness checklist' },
];

export default function EmployeeBuilder({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', nickname: '', role: 'Receptionist',
    tone: 50, warmth: 60, professionalism: 70, confidence: 50, energy: 50, empathy: 60,
    voiceProvider: 'elevenlabs', voice: 'Warm Female', accent: 'Neutral', voiceLanguage: 'English',
    knowledge: { faqs: '', services: '', pricing: '', policies: '', documents: '' },
    tools: { calendar: false, crm: false, email: false, sms: false, payments: false, knowledge: false },
    workflows: { booking: false, leadCapture: false, followUp: false, escalation: false },
    hours: { business: '9am-5pm', afterHours: 'AI handles', holidays: 'AI handles' },
    escalation: { humanTransfer: true, callback: false, ticket: false, notification: true },
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-navy-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">AI Employee Builder</h2>
              <p className="text-xs text-gray-500">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 transition hover:text-white">✕</button>
        </div>

        {/* Step progress bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-6 py-3">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                step === s.id ? 'bg-gold-400/15 text-gold-300' :
                step > s.id ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {step > s.id ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <StepIdentity form={form} setForm={setForm} />}
              {step === 2 && <StepPersonality form={form} setForm={setForm} />}
              {step === 3 && <StepVoice form={form} setForm={setForm} />}
              {step === 4 && <StepKnowledge form={form} setForm={setForm} />}
              {step === 5 && <StepTools form={form} setForm={setForm} />}
              {step === 6 && <StepWorkflows form={form} setForm={setForm} />}
              {step === 7 && <StepHours form={form} setForm={setForm} />}
              {step === 8 && <StepEscalation form={form} setForm={setForm} />}
              {step === 9 && <StepTest form={form} />}
              {step === 10 && <StepLaunch form={form} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <button onClick={prev} disabled={step === 1} className="btn-ghost !py-2.5 !text-xs disabled:opacity-40">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="text-xs text-gray-500">{Math.round((step / STEPS.length) * 100)}% complete</span>
          {step < STEPS.length ? (
            <button onClick={next} className="btn-gold !py-2.5 !text-xs">
              Continue <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button onClick={onClose} className="btn-gold !py-2.5 !text-xs">
              <Rocket className="h-3.5 w-3.5" /> Deploy AI Employee
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

type FormState = ReturnType<typeof useState<any>>[0];
type SetForm = ReturnType<typeof useState<any>>[1];

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-400/50" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-400/50" />
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-gold-300">{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-gold-400" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/20">
      <span className="text-sm text-white">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-gold-400' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function StepIdentity({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Identity</h3>
      <p className="text-sm text-gray-400">Give your AI employee a name and identity.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Aria" />
        <Field label="Nickname" value={form.nickname} onChange={(v) => setForm({ ...form, nickname: v })} placeholder="AI Receptionist" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
            {['Receptionist', 'Sales', 'Support', 'Recruiting', 'Scheduler', 'Dispatcher', 'Custom'].map((r) => <option key={r} value={r} className="bg-navy-900">{r}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Avatar style</label>
          <div className="flex gap-3">
            {['from-gold-300 to-gold-500', 'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-purple-400 to-purple-600'].map((g, i) => (
              <button key={i} className={`h-12 w-12 rounded-xl bg-gradient-to-br ${g} transition hover:scale-110`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPersonality({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-bold text-white">Personality</h3>
      <p className="text-sm text-gray-400">Fine-tune how your AI employee communicates.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Slider label="Tone" value={form.tone} onChange={(v) => setForm({ ...form, tone: v })} />
        <Slider label="Warmth" value={form.warmth} onChange={(v) => setForm({ ...form, warmth: v })} />
        <Slider label="Professionalism" value={form.professionalism} onChange={(v) => setForm({ ...form, professionalism: v })} />
        <Slider label="Confidence" value={form.confidence} onChange={(v) => setForm({ ...form, confidence: v })} />
        <Slider label="Energy" value={form.energy} onChange={(v) => setForm({ ...form, energy: v })} />
        <Slider label="Empathy" value={form.empathy} onChange={(v) => setForm({ ...form, empathy: v })} />
      </div>
    </div>
  );
}

function StepVoice({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Voice</h3>
      <p className="text-sm text-gray-400">Choose how your AI employee sounds. Requires a voice provider connection.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Provider</label>
          <select value={form.voiceProvider} onChange={(e) => setForm({ ...form, voiceProvider: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
            {['elevenlabs', 'azure', 'google', 'aws', 'custom'].map((p) => <option key={p} value={p} className="bg-navy-900">{p}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Voice</label>
          <select value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
            {['Warm Female', 'Confident Female', 'Calm Female', 'Professional Male', 'Direct Male', 'Neutral'].map((v) => <option key={v} value={v} className="bg-navy-900">{v}</option>)}
          </select>
        </div>
        <Field label="Accent" value={form.accent} onChange={(v) => setForm({ ...form, accent: v })} placeholder="Neutral" />
        <Field label="Language" value={form.voiceLanguage} onChange={(v) => setForm({ ...form, voiceLanguage: v })} placeholder="English" />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-gold-300" />
          <span className="text-sm text-white">Voice Preview</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Ready — requires voice provider connection. Connect ElevenLabs or another provider in Integrations to enable voice synthesis.</p>
        <button disabled className="btn-ghost mt-4 !py-2 !text-xs opacity-50">Play preview</button>
      </div>
    </div>
  );
}

function StepKnowledge({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Knowledge</h3>
      <p className="text-sm text-gray-400">What your AI employee knows about your business.</p>
      <div className="space-y-4">
        <TextArea label="FAQs" value={form.knowledge.faqs} onChange={(v) => setForm({ ...form, knowledge: { ...form.knowledge, faqs: v } })} placeholder="Q: What are your hours? A: We're open Mon-Fri 9am-5pm…" />
        <TextArea label="Services" value={form.knowledge.services} onChange={(v) => setForm({ ...form, knowledge: { ...form.knowledge, services: v } })} placeholder="Cleaning, Whitening, Root canal, Emergency care…" />
        <TextArea label="Pricing" value={form.knowledge.pricing} onChange={(v) => setForm({ ...form, knowledge: { ...form.knowledge, pricing: v } })} placeholder="Cleaning: $80, Whitening: $200, Root canal: $800…" />
        <TextArea label="Policies" value={form.knowledge.policies} onChange={(v) => setForm({ ...form, knowledge: { ...form.knowledge, policies: v } })} placeholder="24-hour cancellation policy. Insurance accepted…" />
        <TextArea label="Documents" value={form.knowledge.documents} onChange={(v) => setForm({ ...form, knowledge: { ...form.knowledge, documents: v } })} placeholder="Upload or paste reference documents…" />
      </div>
    </div>
  );
}

function StepTools({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const tools = [
    { key: 'calendar', label: 'Google Calendar', desc: 'Book appointments' },
    { key: 'crm', label: 'CRM', desc: 'Manage leads and customers' },
    { key: 'email', label: 'Email', desc: 'Send notifications' },
    { key: 'sms', label: 'SMS', desc: 'Text reminders' },
    { key: 'payments', label: 'Payments', desc: 'Process payments' },
    { key: 'knowledge', label: 'Knowledge Base', desc: 'Answer from your docs' },
  ];
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Tools</h3>
      <p className="text-sm text-gray-400">Connect the tools your AI employee can use.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <Toggle key={t.key} label={`${t.label} — ${t.desc}`} checked={form.tools[t.key]} onChange={(v) => setForm({ ...form, tools: { ...form.tools, [t.key]: v } })} />
        ))}
      </div>
    </div>
  );
}

function StepWorkflows({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const workflows = [
    { key: 'booking', label: 'Appointment Booking', desc: 'AI checks calendar and books slots' },
    { key: 'leadCapture', label: 'Lead Capture', desc: 'AI collects and qualifies contact info' },
    { key: 'followUp', label: 'Follow-up', desc: 'AI sends reminders and follow-ups' },
    { key: 'escalation', label: 'Escalation', desc: 'AI transfers to human when needed' },
  ];
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Workflows</h3>
      <p className="text-sm text-gray-400">Enable pre-built workflows for your AI employee.</p>
      <div className="grid gap-3">
        {workflows.map((w) => (
          <Toggle key={w.key} label={`${w.label} — ${w.desc}`} checked={form.workflows[w.key]} onChange={(v) => setForm({ ...form, workflows: { ...form.workflows, [w.key]: v } })} />
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Example: Booking Workflow</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          {['Customer calls', 'AI identifies intent', 'Collect info', 'Check calendar', 'Book appointment', 'Send confirmation', 'Update CRM'].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <span className="rounded-lg bg-white/5 px-3 py-1.5">{s}</span>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-gray-600" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepHours({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Working Hours</h3>
      <p className="text-sm text-gray-400">When your AI employee is active and how it behaves outside hours.</p>
      <div className="grid gap-4">
        <Field label="Business hours" value={form.hours.business} onChange={(v) => setForm({ ...form, hours: { ...form.hours, business: v } })} placeholder="Mon-Fri 9am-5pm" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">After-hours behavior</label>
          <select value={form.hours.afterHours} onChange={(e) => setForm({ ...form, hours: { ...form.hours, afterHours: e.target.value } })} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
            {['AI handles', 'Take message', 'Escalate to human', 'Voicemail'].map((o) => <option key={o} value={o} className="bg-navy-900">{o}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Holiday behavior</label>
          <select value={form.hours.holidays} onChange={(e) => setForm({ ...form, hours: { ...form.hours, holidays: e.target.value } })} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
            {['AI handles', 'Closed message', 'Emergency only'].map((o) => <option key={o} value={o} className="bg-navy-900">{o}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepEscalation({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const options = [
    { key: 'humanTransfer', label: 'Human Transfer', desc: 'Transfer to a human agent when needed' },
    { key: 'callback', label: 'Callback', desc: 'Schedule a callback for the customer' },
    { key: 'ticket', label: 'Create Ticket', desc: 'Create a support ticket' },
    { key: 'notification', label: 'Notification', desc: 'Notify your team immediately' },
  ];
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Escalation</h3>
      <p className="text-sm text-gray-400">What happens when your AI employee can't handle something.</p>
      <div className="grid gap-3">
        {options.map((o) => (
          <Toggle key={o.key} label={`${o.label} — ${o.desc}`} checked={form.escalation[o.key]} onChange={(v) => setForm({ ...form, escalation: { ...form.escalation, [o.key]: v } })} />
        ))}
      </div>
    </div>
  );
}

function StepTest({ form }: { form: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: `Hello! I'm ${form.name || 'your AI employee'}. How can I help you today?` },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: 'This is a test response. In production, I would use your configured AI provider and knowledge base to answer accurately.' }]);
    }, 800);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Test</h3>
      <p className="text-sm text-gray-400">Test your AI employee before launching.</p>
      <div className="glass rounded-2xl">
        <div className="h-64 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-gold-400/15 text-white' : 'bg-white/[0.04] text-gray-100'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-white/10 p-4">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a test message…" className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-400/50" />
          <button onClick={send} className="btn-gold !px-5 !py-2.5 !text-xs">Send</button>
        </div>
      </div>
    </div>
  );
}

function StepLaunch({ form }: { form: any }) {
  const checklist = [
    { label: 'Identity configured', done: !!form.name },
    { label: 'Personality set', done: true },
    { label: 'Voice selected', done: !!form.voice },
    { label: 'Knowledge added', done: !!form.knowledge.services || !!form.knowledge.faqs },
    { label: 'Tools connected', done: Object.values(form.tools).some(Boolean) },
    { label: 'Workflows enabled', done: Object.values(form.workflows).some(Boolean) },
    { label: 'Working hours set', done: !!form.hours.business },
    { label: 'Escalation configured', done: Object.values(form.escalation).some(Boolean) },
  ];
  const completed = checklist.filter((c) => c.done).length;
  return (
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-white">Launch</h3>
      <p className="text-sm text-gray-400">Production readiness checklist.</p>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${(completed / checklist.length) * 100}%` }} />
          </div>
          <span className="text-sm font-medium text-gold-300">{completed}/{checklist.length}</span>
        </div>
      </div>
      <div className="space-y-2">
        {checklist.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            {c.done ? <Check className="h-4 w-4 text-emerald-400" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-600" />}
            <span className={`text-sm ${c.done ? 'text-white' : 'text-gray-500'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
