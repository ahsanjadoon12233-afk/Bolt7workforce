import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Phone, Calendar, Users, Zap, Globe, ArrowRight, Play, ChevronDown, Sparkles, X } from 'lucide-react';
import Navbar from './Navbar';
import Pricing from './Pricing';
import ContactForm from './ContactForm';
import { AI_EMPLOYEES, INDUSTRIES, SCENARIOS, INDUSTRY_OPTIONS, SPECIALTY_OPTIONS, type AIEmployee } from '@/lib/catalog';
import DemoChat from './DemoChat';

const WorkforceCore = lazy(() => import('@/components/3d/WorkforceCore'));
const AmbientScene = lazy(() => import('@/components/3d/AmbientScene'));

export default function MarketingSite() {
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);

  return (
    <div id="top" className="relative">
      <Navbar />

      {/* HERO — Cinematic 3D Workforce Core */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><Sparkles className="h-8 w-8 animate-pulse text-gold-400" /></div>}>
          <WorkforceCore onSelectEmployee={setSelectedEmployee} />
        </Suspense>

        {/* Hero overlay text */}
        <div className="pointer-events-none relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="pointer-events-auto"
          >
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" /> AI Workforce Operating System
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] text-white md:text-6xl lg:text-7xl text-balance">
              One AI Workforce. <br />
              <span className="gradient-text">Seven AI Employees.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              Deploy AI digital employees that answer, sell, schedule, and support — 24/7, in any language,
              in any country. This is not a chatbot. This is your workforce.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="#/signup" className="btn-gold">
                Try the AI Workforce <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#builder" className="btn-ghost">
                <Bot className="h-4 w-4" /> Build your AI employee
              </a>
              <a href="#demo" className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-gold-300">
                <Play className="h-4 w-4" /> Watch how it works
              </a>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="h-6 w-6 animate-bounce text-gold-400/50" />
          </motion.div>
        </div>

        {/* Employee detail panel */}
        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 z-20 h-full w-full max-w-md p-6 md:p-10"
            >
              <div className="glass-gold h-full overflow-y-auto rounded-3xl p-8">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${selectedEmployee.color}20`, border: `1px solid ${selectedEmployee.color}40` }}
                >
                  <Bot className="h-8 w-8" style={{ color: selectedEmployee.color }} />
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold text-white">{selectedEmployee.name}</h3>
                <p className="text-sm font-medium uppercase tracking-wider" style={{ color: selectedEmployee.color }}>
                  {selectedEmployee.role}
                </p>
                <p className="mt-3 text-gray-400">"{selectedEmployee.tagline}"</p>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Capabilities</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedEmployee.capabilities.map((c) => (
                      <span key={c} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Voice</p>
                    <p className="mt-1 text-sm text-white">{selectedEmployee.voice}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Languages</p>
                    <p className="mt-1 text-sm text-white">{selectedEmployee.languages.join(', ')}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${selectedEmployee.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                    <span className="text-sm text-white">{selectedEmployee.status}</span>
                  </div>
                </div>

                <button className="btn-gold mt-8 w-full">
                  Try {selectedEmployee.name} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 01 — The workforce is changing */}
      <ScrollSection number="01" title="The workforce is changing" subtitle="THE WORKFORCE IS CHANGING">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-lg text-gray-400">
              The receptionist, the scheduler, the dispatcher, the sales rep — these roles haven't changed in
              a century. But the world has. Customers expect instant answers. Businesses can't afford to miss
              a single call. And the cost of human-only staffing keeps rising.
            </p>
            <p className="mt-6 text-lg text-gray-400">
              <span className="text-white">THE 7 WORKFORCE</span> is the answer: AI employees that work alongside
              your human team — not replacing them, but amplifying them. One AI workforce. Infinite capacity.
            </p>
          </div>
          <div className="relative h-80 overflow-hidden rounded-3xl">
            <Suspense fallback={null}>
              <AmbientScene />
            </Suspense>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
          </div>
        </div>
      </ScrollSection>

      {/* SECTION 02 — Meet your AI employees */}
      <ScrollSection number="02" title="Meet your AI employees" subtitle="MEET YOUR AI EMPLOYEES" dark>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AI_EMPLOYEES.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-all hover:border-white/15"
              onClick={() => setSelectedEmployee(emp)}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                style={{ backgroundColor: `${emp.color}15`, border: `1px solid ${emp.color}30` }}
              >
                <Bot className="h-7 w-7" style={{ color: emp.color }} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{emp.name}</h3>
              <p className="text-sm font-medium" style={{ color: emp.color }}>{emp.role}</p>
              <p className="mt-2 text-sm text-gray-500">"{emp.tagline}"</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {emp.capabilities.slice(0, 3).map((c) => (
                  <span key={c} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-gray-400">{c}</span>
                ))}
                {emp.capabilities.length > 3 && (
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-gray-400">
                    +{emp.capabilities.length - 3}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">{emp.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      {/* SECTION 03 — Give them your business */}
      <ScrollSection number="03" title="Give them your business" subtitle="GIVE THEM YOUR BUSINESS">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: Sparkles, label: 'Knowledge', desc: 'Upload FAQs, docs, policies — your AI learns instantly.' },
            { icon: Bot, label: 'Personality', desc: 'Tone, warmth, energy, empathy — fully customizable.' },
            { icon: Zap, label: 'Voice', desc: 'Choose from multiple voices, accents, and languages.' },
            { icon: Calendar, label: 'Tools', desc: 'Calendar, CRM, email, SMS, payments — one-click connect.' },
            { icon: Users, label: 'Workflows', desc: 'Visual builder for booking, follow-up, escalation.' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
            >
              <item.icon className="h-7 w-7 text-gold-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">{item.label}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      {/* SECTION 04 — Let them work */}
      <ScrollSection number="04" title="Let them work" subtitle="LET THEM WORK" dark>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Phone, label: 'Calls', desc: 'Answers and routes phone calls 24/7' },
            { icon: Bot, label: 'Chats', desc: 'Handles web chat conversations in real-time' },
            { icon: Calendar, label: 'Bookings', desc: 'Books appointments directly into your calendar' },
            { icon: Users, label: 'CRM', desc: 'Captures and qualifies every lead automatically' },
            { icon: Zap, label: 'Payments', desc: 'Processes payments and sends invoices' },
            { icon: Globe, label: 'Follow-ups', desc: 'Sends reminders and follow-ups automatically' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">{item.label}</h3>
              <p className="mt-1.5 text-xs text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      {/* SECTION 05 — You stay in control (dashboard preview) */}
      <ScrollSection number="05" title="You stay in control" subtitle="YOU STAY IN CONTROL">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-lg text-gray-400">
              Your AI workforce runs autonomously — but you're always in command. Monitor every conversation,
              every call, every lead. Take over when you want. Pause when you need. Scale when you're ready.
            </p>
            <div className="mt-6 space-y-4">
              {[
                'Real-time workforce status — see every AI employee, every conversation',
                'Take over any conversation instantly — human handoff in one click',
                'Full audit trail — every action, every decision, every outcome',
                'Analytics that matter — resolution rate, response time, revenue',
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  <p className="text-sm text-gray-300">{t}</p>
                </div>
              ))}
            </div>
            <a href="#/signup" className="btn-gold mt-8">
              Explore the Command Center <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 p-6">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Active', value: '7', color: 'text-emerald-400' },
                { label: 'Conversations', value: '1,284', color: 'text-white' },
                { label: 'Calls', value: '342', color: 'text-white' },
                { label: 'Leads', value: '89', color: 'text-gold-300' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.03] p-4">
                  <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {AI_EMPLOYEES.slice(0, 4).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg" style={{ backgroundColor: `${emp.color}20` }} />
                    <div>
                      <p className="text-sm font-medium text-white">{emp.name}</p>
                      <p className="text-[10px] text-gray-500">{emp.role}</p>
                    </div>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* LIVE AI DEMO */}
      <section id="demo" className="relative section-pad overflow-hidden bg-navy-900/40">
        <div className="container-x">
          <LiveAIDemo />
        </div>
      </section>

      {/* PRICING */}
      <section className="section-pad">
        <div className="container-x">
          <Pricing />
        </div>
      </section>

      {/* SECTION 06 — One workforce. Infinite possibilities. */}
      <section className="relative overflow-hidden py-28">
        <Suspense fallback={null}>
          <AmbientScene />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/80 to-navy-950" />
        <div className="container-x relative z-10 px-6 text-center md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="eyebrow">One workforce. Infinite possibilities.</span>
            <h2 className="mt-6 font-display text-4xl font-extrabold text-white md:text-6xl text-balance">
              Your AI workforce is <span className="gradient-text">ready to deploy.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
              Start with one AI employee. Scale to seven. Pay in your currency. Launch in any country.
              This is the future of work — available today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="#/signup" className="btn-gold">
                Start 14-day free trial <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="btn-ghost">Talk to our team</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section-pad bg-navy-900/40">
        <div className="container-x">
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-12 md:px-12">
        <div className="container-x grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
                <Bot className="h-5 w-5" />
              </div>
              <span className="font-display text-sm font-bold text-white">THE 7 <span className="gradient-text">WORKFORCE</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-gray-400">
              The AI Workforce Operating System. Deploy AI digital employees that answer, sell, schedule, and support — 24/7, worldwide.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><a href="#demo" className="hover:text-gold-300">Live Demo</a></li>
              <li><a href="#pricing" className="hover:text-gold-300">Pricing</a></li>
              <li><a href="#/signup" className="hover:text-gold-300">Get Started</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><a href="#contact" className="hover:text-gold-300">Contact</a></li>
              <li><a href="#" className="hover:text-gold-300">Privacy</a></li>
              <li><a href="#" className="hover:text-gold-300">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="container-x mt-10 border-t border-white/5 pt-6 text-center text-xs text-gray-600">
          © 2026 THE 7 WORKFORCE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ScrollSection({ number, title, subtitle, children, dark }: {
  number: string; title: string; subtitle: string; children: React.ReactNode; dark?: boolean;
}) {
  return (
    <section className={`section-pad ${dark ? 'bg-navy-900/40' : ''}`}>
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-baseline gap-4">
            <span className="font-display text-6xl font-bold text-gold-400/10">{number}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">{subtitle}</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-white md:text-5xl text-balance">{title}</h2>
            </div>
          </div>
        </motion.div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function LiveAIDemo() {
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [employee, setEmployee] = useState(AI_EMPLOYEES[0].id);
  const [scenario, setScenario] = useState<string | null>(null);

  const selectedEmp = AI_EMPLOYEES.find((e) => e.id === employee)!;

  return (
    <div>
      <div className="mb-10 text-center">
        <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Live AI Workforce Demo</span>
        <h2 className="mt-6 font-display text-3xl font-bold text-white md:text-5xl text-balance">
          See your AI employee <span className="gradient-text">in action</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">
          Pick an industry, choose an AI employee, and start a conversation. No API key required — the demo
          works with scripted responses so it never breaks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Config panel */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50"
            >
              {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i} className="bg-navy-900">{i}</option>)}
            </select>
            <p className="mt-3 text-xs text-gray-500">
              Specialties: {SPECIALTY_OPTIONS[industry]?.join(', ') ?? 'General'}
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">AI Employee</label>
            <div className="mt-3 space-y-2">
              {AI_EMPLOYEES.slice(0, 5).map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setEmployee(emp.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    employee === emp.id ? 'border-gold-400/40 bg-gold-400/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg" style={{ backgroundColor: `${emp.color}20`, border: `1px solid ${emp.color}30` }} />
                  <div>
                    <p className="text-sm font-medium text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-500">{emp.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Scenario</label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                    scenario === s.id ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${selectedEmp.color}20`, border: `1px solid ${selectedEmp.color}40` }}
            >
              <Bot className="h-5 w-5" style={{ color: selectedEmp.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{selectedEmp.name} — {selectedEmp.role}</p>
              <p className="text-xs text-gray-500">{industry} · {selectedEmp.languages.join(', ')}</p>
            </div>
          </div>
          <DemoChat />
        </div>
      </div>
    </div>
  );
}
