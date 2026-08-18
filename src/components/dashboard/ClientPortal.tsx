import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type {
  Organization, AIAgent, Lead, Appointment, Subscription, Integration, KnowledgeBaseEntry,
  Conversation, Call, Customer, PaymentTransaction,
} from '@/lib/types';
import { AI_EMPLOYEES, PAYMENT_METHODS, TEMPLATES, INDUSTRIES } from '@/lib/catalog';
import {
  Bot, Users, Calendar, CreditCard, Plug, LogOut, Building2, Save, Plus,
  CheckCircle2, XCircle, AlertTriangle, Activity, Mail, Phone, Clock, BookOpen,
  MessageSquare, BarChart3, Bell, Menu, Settings, Zap, Workflow as WorkflowIcon,
  ChevronRight, ChevronLeft, TrendingUp, DollarSign, Sparkles, Volume2, Search,
  Layers, Globe, ArrowRight, Filter,
} from 'lucide-react';
import EmployeeBuilder from './EmployeeBuilder';

const WorkforceCore = lazy(() => import('@/components/3d/WorkforceCore'));

type Tab =
  | 'overview' | 'conversations' | 'employees' | 'crm' | 'calendar'
  | 'payments' | 'analytics' | 'knowledge' | 'workflows' | 'voice'
  | 'integrations' | 'setup' | 'billing';

export default function ClientPortal() {
  const { signOut, user, orgId } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [kb, setKb] = useState<KnowledgeBaseEntry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const [o, a, l, ap, s, i, k, c, ca, cu, tx] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', orgId).maybeSingle(),
      supabase.from('ai_agents').select('*').eq('org_id', orgId).limit(1).maybeSingle(),
      supabase.from('leads').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('org_id', orgId).order('start_at', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('org_id', orgId).limit(1).maybeSingle(),
      supabase.from('integrations').select('*').eq('org_id', orgId),
      supabase.from('knowledge_base').select('*').eq('org_id', orgId),
      supabase.from('conversations').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(50),
      supabase.from('calls').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(50),
      supabase.from('customers').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
      supabase.from('payment_transactions').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
    ]);
    setOrg(o.data as Organization);
    setAgent(a.data as AIAgent);
    setLeads((l.data as Lead[]) ?? []);
    setAppointments((ap.data as Appointment[]) ?? []);
    setSub(s.data as Subscription);
    setIntegrations((i.data as Integration[]) ?? []);
    setKb((k.data as KnowledgeBaseEntry[]) ?? []);
    setConversations((c.data as Conversation[]) ?? []);
    setCalls((ca.data as Call[]) ?? []);
    setCustomers((cu.data as Customer[]) ?? []);
    setTransactions((tx.data as PaymentTransaction[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const NAV_GROUPS: { label: string; items: { id: Tab; label: string; icon: typeof Bot }[] }[] = [
    { label: 'Command', items: [
      { id: 'overview', label: 'Overview', icon: Activity },
      { id: 'conversations', label: 'Conversations', icon: MessageSquare },
      { id: 'employees', label: 'AI Employees', icon: Bot },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]},
    { label: 'Operations', items: [
      { id: 'crm', label: 'CRM', icon: Users },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'payments', label: 'Payments', icon: CreditCard },
    ]},
    { label: 'Configure', items: [
      { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
      { id: 'workflows', label: 'Workflows', icon: WorkflowIcon },
      { id: 'voice', label: 'Voice Lab', icon: Zap },
      { id: 'integrations', label: 'Integrations', icon: Plug },
      { id: 'setup', label: 'Setup Center', icon: Settings },
      { id: 'billing', label: 'Billing', icon: CreditCard },
    ]},
  ];

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/10 bg-navy-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xs font-bold text-white">{org?.name ?? 'Your Business'}</p>
            <p className="text-[9px] uppercase tracking-wider text-gold-300">Workforce Portal</p>
          </div>
        </div>
        <nav className="flex flex-col gap-5 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      tab === item.id ? 'bg-gold-400/10 text-gold-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                {user?.email?.[0]?.toUpperCase() ?? 'C'}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{user?.email}</p>
                <p className="text-[10px] text-gold-300">Client</p>
              </div>
            </div>
            <button onClick={signOut} className="text-gray-500 transition hover:text-red-400">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-navy-950/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-display text-lg font-bold capitalize text-white">{tab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 transition hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold-400" />
            </button>
            <button onClick={() => setShowBuilder(true)} className="btn-gold !px-4 !py-2 !text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Build AI Employee
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <Activity className="h-6 w-6 animate-pulse" /> <span className="ml-3">Loading…</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'overview' && <Overview org={org} agent={agent} leads={leads} appointments={appointments} conversations={conversations} calls={calls} sub={sub} integrations={integrations} />}
                {tab === 'conversations' && <ConversationsView conversations={conversations} calls={calls} />}
                {tab === 'employees' && <EmployeesView agent={agent} orgId={orgId} kb={kb} onSaved={load} />}
                {tab === 'crm' && <CRMView leads={leads} customers={customers} />}
                {tab === 'calendar' && <CalendarView appointments={appointments} />}
                {tab === 'payments' && <PaymentsView transactions={transactions} orgId={orgId} onSaved={load} />}
                {tab === 'analytics' && <AnalyticsView leads={leads} conversations={conversations} calls={calls} appointments={appointments} />}
                {tab === 'knowledge' && <KnowledgeView kb={kb} orgId={orgId} agentId={agent?.id ?? null} onSaved={load} />}
                {tab === 'workflows' && <WorkflowsView />}
                {tab === 'voice' && <VoiceLabView integrations={integrations} />}
                {tab === 'integrations' && <IntegrationsView integrations={integrations} orgId={orgId} onSaved={load} />}
                {tab === 'setup' && <SetupCenterView org={org} agent={agent} integrations={integrations} kb={kb} />}
                {tab === 'billing' && <BillingView sub={sub} org={org} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {showBuilder && <EmployeeBuilder onClose={() => setShowBuilder(false)} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Bot; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-gray-600">{sub}</p>}
    </motion.div>
  );
}

function Overview({ org, agent, leads, appointments, conversations, calls, sub, integrations }: {
  org: Organization | null; agent: AIAgent | null; leads: Lead[]; appointments: Appointment[];
  conversations: Conversation[]; calls: Call[]; sub: Subscription | null; integrations: Integration[];
}) {
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const upcoming = appointments.filter((a) => new Date(a.start_at) > new Date()).length;
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const todayConvs = conversations.filter((c) => new Date(c.created_at).toDateString() === new Date().toDateString()).length;
  const todayCalls = calls.filter((c) => new Date(c.created_at).toDateString() === new Date().toDateString()).length;
  const resolved = conversations.filter((c) => c.status === 'resolved').length;
  const resolutionRate = conversations.length ? ((resolved / conversations.length) * 100).toFixed(0) : '—';

  return (
    <div className="space-y-8">
      {/* Workforce status 3D */}
      <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-navy-900/40">
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Sparkles className="h-6 w-6 animate-pulse text-gold-400" /></div>}>
          <WorkforceCore onSelectEmployee={() => {}} />
        </Suspense>
        <div className="pointer-events-none absolute left-5 top-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">Workforce Status</p>
          <p className="font-display text-xl font-bold text-white">{agent?.status === 'active' ? '1 AI Employee Active' : 'No AI Employee Active'}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bot} label="Agent status" value={agent?.status ?? 'Not set up'} color="bg-gold-400/15 text-gold-300" />
        <StatCard icon={MessageSquare} label="Conversations today" value={todayConvs} color="bg-blue-500/15 text-blue-300" />
        <StatCard icon={Phone} label="Calls today" value={todayCalls} color="bg-purple-500/15 text-purple-300" />
        <StatCard icon={TrendingUp} label="AI resolution rate" value={resolutionRate === '—' ? '—' : `${resolutionRate}%`} color="bg-emerald-500/15 text-emerald-300" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total leads" value={leads.length} sub={`${newLeads} new`} color="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={Calendar} label="Upcoming appts" value={upcoming} color="bg-blue-500/15 text-blue-300" />
        <StatCard icon={CreditCard} label="Plan" value={sub?.plan ?? 'trial'} color="bg-gold-400/15 text-gold-300" />
        <StatCard icon={Plug} label="Integrations" value={`${connectedCount}/${integrations.length || 0}`} color="bg-purple-500/15 text-purple-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white">Your AI Employee</h3>
          {agent ? (
            <div className="mt-4 space-y-3">
              <Row label="Name" value={agent.name} />
              <Row label="Language" value={agent.language} />
              <Row label="Tone" value={agent.tone ?? '—'} />
              <Row label="Capabilities" value={agent.capabilities.join(', ')} />
              <Row label="Status" value={agent.status} />
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-500">No AI employee configured yet.</p>
              <p className="mt-2 text-xs text-gray-600">Click "Build AI Employee" to create your first AI digital employee.</p>
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white">Recent conversations</h3>
          <div className="mt-4 space-y-2">
            {conversations.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10 text-gold-300">
                    {c.channel === 'voice' ? <Phone className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.customer_name ?? 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500">{c.channel} · {c.intent ?? '—'}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  c.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-300' :
                  c.status === 'escalated' ? 'bg-orange-500/15 text-orange-300' : 'bg-blue-500/15 text-blue-300'
                }`}>{c.status}</span>
              </div>
            ))}
            {conversations.length === 0 && <p className="text-sm text-gray-500">No conversations yet. Your AI employee will handle them automatically.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-white capitalize">{value}</span>
    </div>
  );
}

function ConversationsView({ conversations, calls }: { conversations: Conversation[]; calls: Call[] }) {
  const [channel, setChannel] = useState('all');
  const channels = ['all', 'chat', 'voice', 'sms', 'email', 'whatsapp'];
  const filtered = channel === 'all' ? conversations : conversations.filter((c) => c.channel === channel);

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {channels.map((ch) => (
          <button key={ch} onClick={() => setChannel(ch)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${channel === ch ? 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950' : 'border border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'}`}>
            {ch}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((c) => (
          <motion.div key={c.id} whileHover={{ x: 4 }} className="flex items-center justify-between rounded-2xl glass p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
                {c.channel === 'voice' ? <Phone className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold text-white">{c.customer_name ?? 'Unknown customer'}</p>
                <p className="text-xs text-gray-500">{c.channel} · {c.customer_contact ?? '—'} · {c.intent ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${c.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-300' : c.status === 'escalated' ? 'bg-orange-500/15 text-orange-300' : c.status === 'transferred' ? 'bg-purple-500/15 text-purple-300' : c.status === 'closed' ? 'bg-gray-500/15 text-gray-400' : 'bg-blue-500/15 text-blue-300'}`}>{c.status}</span>
              <span className="text-xs text-gray-600">{new Date(c.created_at).toLocaleString()}</span>
              <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:border-gold-400/30 hover:text-gold-300">Open</button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="flex h-40 items-center justify-center text-gray-500"><p>No conversations yet. {conversations.length === 0 ? 'Your AI employees haven\'t had any conversations yet.' : 'Try a different channel filter.'}</p></div>}
      </div>
    </div>
  );
}

function EmployeesView({ agent, orgId, kb, onSaved }: {
  agent: AIAgent | null; orgId: string | null; kb: KnowledgeBaseEntry[]; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: agent?.name ?? 'AI Receptionist',
    personality: agent?.personality ?? '',
    tone: agent?.tone ?? 'professional',
    language: agent?.language ?? 'en',
    greeting: agent?.greeting ?? '',
    business_description: agent?.business_description ?? '',
    services: agent?.services ?? '',
    hours: agent?.hours ?? '',
    status: agent?.status ?? 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    if (agent) {
      await supabase.from('ai_agents').update(form).eq('id', agent.id);
    } else {
      await supabase.from('ai_agents').insert({ ...form, org_id: orgId });
    }
    setSaving(false);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {AI_EMPLOYEES.map((emp) => (
          <div key={emp.id} className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${emp.color}15`, border: `1px solid ${emp.color}30` }}>
              <Bot className="h-6 w-6" style={{ color: emp.color }} />
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-white">{emp.name}</h3>
            <p className="text-xs font-medium" style={{ color: emp.color }}>{emp.role}</p>
            <p className="mt-1.5 text-[11px] text-gray-500">"{emp.tagline}"</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{emp.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white">Agent configuration</h3>
        <p className="mt-1 text-sm text-gray-400">Customize how your AI employee behaves and what it knows.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormField label="Agent name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <FormField label="Tone" value={form.tone} onChange={(v) => setForm({ ...form, tone: v })} />
          <FormField label="Primary language" value={form.language} onChange={(v) => setForm({ ...form, language: v })} />
          <FormField label="Business hours" value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} placeholder="Mon-Fri 9am-5pm" />
        </div>
        <div className="mt-4 space-y-4">
          <FormTextArea label="Greeting" value={form.greeting} onChange={(v) => setForm({ ...form, greeting: v })} placeholder="Hi! Thanks for reaching out. How can I help?" />
          <FormTextArea label="Business description" value={form.business_description} onChange={(v) => setForm({ ...form, business_description: v })} placeholder="We are a dental clinic in Dubai offering cleanings, whitening, and emergency care." />
          <FormTextArea label="Services" value={form.services} onChange={(v) => setForm({ ...form, services: v })} placeholder="Cleaning, Whitening, Root canal, Emergency, Consultation" />
          <FormTextArea label="Personality" value={form.personality} onChange={(v) => setForm({ ...form, personality: v })} placeholder="Warm, professional, concise. Always offer to book an appointment." />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button onClick={save} disabled={saving} className="btn-gold">
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save agent'} <Save className="h-4 w-4" />
          </button>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
            {['draft', 'active', 'paused'].map((s) => <option key={s} value={s} className="bg-navy-900 capitalize">{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-400/50" />
    </div>
  );
}

function FormTextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-400/50" />
    </div>
  );
}

function CRMView({ leads, customers }: { leads: Lead[]; customers: Customer[] }) {
  const [view, setView] = useState<'leads' | 'customers' | 'pipeline'>('leads');

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['leads', 'customers', 'pipeline'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${view === v ? 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950' : 'border border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'}`}>{v}</button>
        ))}
      </div>

      {view === 'leads' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Source</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{l.name}</td>
                  <td className="py-3 pr-4 text-gray-400">
                    {l.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {l.email}</span>}
                    {l.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {l.phone}</span>}
                    {!l.email && !l.phone && '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{l.source}</td>
                  <td className="py-3 pr-4 text-gray-400">{l.qualification_score}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${l.status === 'new' ? 'bg-blue-500/15 text-blue-300' : l.status === 'qualified' ? 'bg-emerald-500/15 text-emerald-300' : l.status === 'converted' ? 'bg-gold-400/15 text-gold-300' : 'bg-gray-500/15 text-gray-400'}`}>{l.status}</span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <p className="mt-6 text-sm text-gray-500">No leads captured yet. Your AI employee will collect them automatically.</p>}
        </div>
      )}

      {view === 'customers' && (
        <div className="space-y-3">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl glass p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.email ?? c.phone ?? '—'} · {c.company ?? '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gold-300">${c.lifetime_value.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Lifetime value</p>
              </div>
            </div>
          ))}
          {customers.length === 0 && <p className="text-sm text-gray-500">No customers yet. Leads that convert will appear here.</p>}
        </div>
      )}

      {view === 'pipeline' && (
        <div className="grid gap-4 md:grid-cols-5">
          {(['new', 'contacted', 'qualified', 'converted', 'lost'] as const).map((status) => {
            const items = leads.filter((l) => l.status === status);
            return (
              <div key={status} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{status} ({items.length})</p>
                <div className="space-y-2">
                  {items.map((l) => (
                    <div key={l.id} className="rounded-lg bg-white/[0.03] p-3">
                      <p className="text-sm font-medium text-white">{l.name}</p>
                      <p className="text-[10px] text-gray-500">{l.email ?? l.phone ?? '—'}</p>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-[10px] text-gray-600">Empty</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarView({ appointments }: { appointments: Appointment[] }) {
  const [view, setView] = useState<'month' | 'week' | 'list'>('list');
  const today = new Date();
  const upcoming = appointments.filter((a) => new Date(a.start_at) >= today);
  const past = appointments.filter((a) => new Date(a.start_at) < today);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {(['month', 'week', 'list'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${view === v ? 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950' : 'border border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'}`}>{v}</button>
          ))}
        </div>
        <button className="btn-gold !py-2.5 !text-xs"><Plus className="h-3.5 w-3.5" /> New appointment</button>
      </div>

      {view === 'list' && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Upcoming ({upcoming.length})</h3>
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-2xl glass p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300"><Calendar className="h-5 w-5" /></div>
                    <div>
                      <p className="font-semibold text-white">{a.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(a.start_at).toLocaleString()} — {new Date(a.end_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${a.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' : a.status === 'completed' ? 'bg-blue-500/15 text-blue-300' : a.status === 'cancelled' ? 'bg-red-500/15 text-red-300' : 'bg-orange-500/15 text-orange-300'}`}>{a.status}</span>
                </div>
              ))}
              {upcoming.length === 0 && <p className="text-sm text-gray-500">No upcoming appointments.</p>}
            </div>
          </div>
          {past.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Past ({past.length})</h3>
              <div className="space-y-3">
                {past.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-2xl glass p-5 opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-500"><Calendar className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-white">{a.title}</p>
                        <p className="text-xs text-gray-500">{new Date(a.start_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'month' && (
        <div className="glass rounded-2xl p-6">
          <p className="text-center text-sm text-gray-500">Calendar month view — connect Google Calendar in Integrations to sync real availability and bookings.</p>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-gray-600">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="py-2 font-semibold">{d}</div>)}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 1;
              const date = new Date(today.getFullYear(), today.getMonth(), day);
              const hasAppt = appointments.some((a) => new Date(a.start_at).toDateString() === date.toDateString());
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div key={i} className={`rounded-lg p-2 text-center ${isToday ? 'bg-gold-400/15 text-gold-300' : 'bg-white/[0.02] text-gray-400'}`}>
                  <p className="text-xs">{date.getDate() > 0 && date.getMonth() === today.getMonth() ? date.getDate() : ''}</p>
                  {hasAppt && <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-gold-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="glass rounded-2xl p-6">
          <p className="text-center text-sm text-gray-500">Calendar week view — shows AI-booked and human-booked appointments.</p>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(today);
              date.setDate(today.getDate() - today.getDay() + i);
              const dayAppts = appointments.filter((a) => new Date(a.start_at).toDateString() === date.toDateString());
              return (
                <div key={i} className="min-h-[120px] rounded-lg bg-white/[0.02] p-2">
                  <p className="text-xs font-semibold text-gray-500">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</p>
                  <p className="text-xs text-gray-400">{date.getDate()}</p>
                  <div className="mt-1 space-y-1">
                    {dayAppts.map((a) => (
                      <div key={a.id} className="rounded bg-gold-400/10 px-1.5 py-1 text-[10px] text-gold-300">{a.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsView({ transactions, orgId, onSaved }: {
  transactions: PaymentTransaction[]; orgId: string | null; onSaved: () => void;
}) {
  const [toggling, setToggling] = useState<string | null>(null);

  const toggleProvider = async (methodId: string) => {
    if (!orgId) return;
    setToggling(methodId);
    const { data: existing } = await supabase.from('payment_providers').select('*').eq('org_id', orgId).eq('provider', methodId).maybeSingle();
    if (existing) {
      await supabase.from('payment_providers').update({ status: existing.status === 'configured' ? 'not-configured' : 'configured', connected_at: existing.status === 'configured' ? null : new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('payment_providers').insert({ org_id: orgId, provider: methodId, status: 'configured', connected_at: new Date().toISOString() });
    }
    setToggling(null);
    onSaved();
  };

  const totalPaid = transactions.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter((t) => t.status === 'pending').length;
  const failed = transactions.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Payment Center</h2>
        <p className="mt-1 text-sm text-gray-400">Pakistan-first payment methods with international support. Configure which methods your business accepts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total paid" value={`$${totalPaid.toLocaleString()}`} color="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={Clock} label="Pending" value={pending} color="bg-orange-500/15 text-orange-300" />
        <StatCard icon={XCircle} label="Failed" value={failed} color="bg-red-500/15 text-red-300" />
        <StatCard icon={CreditCard} label="Transactions" value={transactions.length} color="bg-blue-500/15 text-blue-300" />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Methods</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-[10px] text-gray-500">{m.type} · {m.region}</p>
                </div>
                <span className={`h-2 w-2 rounded-full ${m.status === 'configured' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              </div>
              <button
                onClick={() => toggleProvider(m.id)}
                disabled={toggling === m.id}
                className={`mt-4 w-full rounded-lg py-2 text-xs font-medium transition ${m.status === 'configured' ? 'border border-white/10 bg-white/[0.02] text-gray-300 hover:border-red-500/30 hover:text-red-300' : 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950 hover:scale-[1.02]'}`}
              >
                {toggling === m.id ? '…' : m.status === 'configured' ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                <th className="py-3 pr-4">Provider</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Currency</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Reference</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{t.provider}</td>
                  <td className="py-3 pr-4 text-gray-300">${t.amount.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-gray-400">{t.currency}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${t.status === 'paid' ? 'bg-emerald-500/15 text-emerald-300' : t.status === 'pending' ? 'bg-orange-500/15 text-orange-300' : t.status === 'failed' ? 'bg-red-500/15 text-red-300' : t.status === 'refunded' ? 'bg-purple-500/15 text-purple-300' : 'bg-gray-500/15 text-gray-400'}`}>{t.status}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{t.reference ?? '—'}</td>
                  <td className="py-3 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="mt-6 text-sm text-gray-500">No transactions yet. Payments will appear here once your AI employee processes them.</p>}
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ leads, conversations, calls, appointments }: {
  leads: Lead[]; conversations: Conversation[]; calls: Call[]; appointments: Appointment[];
}) {
  const [range, setRange] = useState('30');
  const resolved = conversations.filter((c) => c.status === 'resolved').length;
  const resolutionRate = conversations.length ? ((resolved / conversations.length) * 100).toFixed(0) : '—';
  const missedCalls = calls.filter((c) => c.status === 'missed').length;
  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const completedAppts = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Analytics Center</h2>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {['Today', '7', '30', '90'].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${range === r ? 'bg-gold-400/20 text-gold-300' : 'text-gray-400 hover:text-white'}`}>{r === 'Today' ? 'Today' : `${r}d`}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessageSquare} label="Conversations" value={conversations.length} color="bg-blue-500/15 text-blue-300" />
        <StatCard icon={Phone} label="Calls" value={calls.length} sub={`${missedCalls} missed`} color="bg-purple-500/15 text-purple-300" />
        <StatCard icon={TrendingUp} label="Resolution rate" value={resolutionRate === '—' ? '—' : `${resolutionRate}%`} color="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={Users} label="Leads" value={leads.length} color="bg-gold-400/15 text-gold-300" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Resolved" value={resolved} color="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={AlertTriangle} label="Escalated" value={conversations.filter((c) => c.status === 'escalated').length} color="bg-orange-500/15 text-orange-300" />
        <StatCard icon={Phone} label="Completed calls" value={completedCalls} color="bg-blue-500/15 text-blue-300" />
        <StatCard icon={Calendar} label="Completed appts" value={completedAppts} color="bg-gold-400/15 text-gold-300" />
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white">Conversation status breakdown</h3>
        <div className="mt-5 space-y-3">
          {['active', 'resolved', 'escalated', 'transferred', 'closed'].map((status) => {
            const count = conversations.filter((c) => c.status === status).length;
            const pct = conversations.length ? (count / conversations.length) * 100 : 0;
            return (
              <div key={status}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-gray-300">{status}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && <p className="text-sm text-gray-500">No conversation data yet.</p>}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white">AI Quality Center</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Listen', value: '—' }, { label: 'Understand', value: '—' },
            { label: 'Respond', value: '—' }, { label: 'Help', value: '—' },
            { label: 'Protect', value: '—' }, { label: 'Remember', value: '—' },
            { label: 'Grow', value: '—' }, { label: 'Resolution', value: resolutionRate === '—' ? '—' : `${resolutionRate}%` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-white/[0.02] p-4">
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className="mt-1 font-display text-xl font-bold text-white">{m.value}</p>
            </div>
          ))}
        </div>
        {conversations.length === 0 && <p className="mt-4 text-xs text-gray-600">Insufficient data — deploy AI employees and start having conversations to see quality metrics.</p>}
      </div>
    </div>
  );
}

function KnowledgeView({ kb, orgId, agentId, onSaved }: {
  kb: KnowledgeBaseEntry[]; orgId: string | null; agentId: string | null; onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Business');
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!orgId || !agentId || !title.trim() || !content.trim()) return;
    setSaving(true);
    await supabase.from('knowledge_base').insert({ agent_id: agentId, org_id: orgId, title, content, category });
    setTitle(''); setContent(''); setSaving(false); onSaved();
  };

  const del = async (id: string) => {
    await supabase.from('knowledge_base').delete().eq('id', id);
    onSaved();
  };

  const categories = ['Business', 'Services', 'FAQs', 'Pricing', 'Policies', 'Documents', 'Locations', 'Hours'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Knowledge Center</h2>
        <p className="mt-1 text-sm text-gray-400">Your AI employee uses this knowledge to answer questions accurately.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white">Add knowledge entry</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Title" value={title} onChange={setTitle} placeholder="Business hours" />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
              {categories.map((c) => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <FormTextArea label="Content" value={content} onChange={setContent} placeholder="We are open Monday to Friday, 9am to 5pm. Closed on weekends and public holidays." />
        </div>
        <button onClick={add} disabled={saving || !title.trim() || !content.trim()} className="btn-gold mt-4 !py-2.5 !text-xs disabled:opacity-40">
          <Plus className="h-3.5 w-3.5" /> {saving ? 'Adding…' : 'Add entry'}
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Existing entries ({kb.length})</h3>
        <div className="space-y-2">
          {kb.map((e) => (
            <div key={e.id} className="flex items-start justify-between rounded-lg bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{e.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{e.category} · {e.content.slice(0, 100)}…</p>
              </div>
              <button onClick={() => del(e.id)} className="text-xs text-gray-600 transition hover:text-red-400">Delete</button>
            </div>
          ))}
          {kb.length === 0 && <p className="text-sm text-gray-500">No knowledge entries yet. Add some above.</p>}
        </div>
      </div>
    </div>
  );
}

function WorkflowsView() {
  const exampleSteps = ['Customer calls', 'AI identifies intent', 'Collect customer info', 'Check calendar', 'Book appointment', 'Send confirmation', 'Update CRM'];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Workflow Builder</h2>
        <p className="mt-1 text-sm text-gray-400">Visual workflows that your AI employees follow. Architecture is extensible — create custom workflows for any process.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white">Example: Appointment Booking Workflow</h3>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {exampleSteps.map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-xl border border-gold-400/20 bg-gold-400/5 px-4 py-2.5 text-sm text-white">
                <span className="mr-2 text-xs text-gold-400">{String(i + 1).padStart(2, '0')}</span>{s}
              </div>
              {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-gray-600" />}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white">Available workflow templates</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { name: 'Appointment Booking', desc: 'AI checks calendar and books slots', steps: 7 },
            { name: 'Lead Capture', desc: 'AI collects and qualifies contact info', steps: 5 },
            { name: 'Follow-up', desc: 'AI sends reminders and follow-ups', steps: 4 },
            { name: 'Escalation', desc: 'AI transfers to human when needed', steps: 3 },
          ].map((w) => (
            <div key={w.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-semibold text-white">{w.name}</p>
              <p className="mt-1 text-xs text-gray-500">{w.desc}</p>
              <p className="mt-2 text-[10px] text-gray-600">{w.steps} steps</p>
              <button className="btn-ghost mt-3 w-full !py-2 !text-xs">Use workflow</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceLabView({ integrations }: { integrations: Integration[] }) {
  const voiceConnected = integrations.some((i) => i.provider === 'openai' && i.status === 'connected');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Voice Lab</h2>
        <p className="mt-1 text-sm text-gray-400">Configure and preview your AI employee's voice. Uses ElevenLabs architecture when configured.</p>
      </div>

      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-300">
            <Volume2 className="h-8 w-8" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">Voice Preview</p>
            <p className="text-sm text-gray-500">{voiceConnected ? 'Voice provider connected' : 'Ready — requires voice provider connection'}</p>
          </div>
        </div>

        {/* Waveform visualization */}
        <div className="mt-6 flex h-20 items-end justify-center gap-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gold-400/40"
              style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`, animation: `pulseGlow ${1 + (i % 3) * 0.3}s ease-in-out infinite` }}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Provider</label>
            <select className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
              {['elevenlabs', 'azure', 'google', 'aws', 'custom'].map((p) => <option key={p} value={p} className="bg-navy-900">{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Voice</label>
            <select className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
              {['Warm Female', 'Confident Female', 'Professional Male', 'Neutral'].map((v) => <option key={v} value={v} className="bg-navy-900">{v}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Language</label>
            <select className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
              {['English', 'Urdu', 'Arabic', 'Spanish'].map((l) => <option key={l} value={l} className="bg-navy-900">{l}</option>)}
            </select>
          </div>
        </div>

        <button disabled={!voiceConnected} className="btn-gold mt-6 disabled:opacity-40">
          <Volume2 className="h-4 w-4" /> {voiceConnected ? 'Play preview' : 'Not configured — connect in Integrations'}
        </button>
      </div>
    </div>
  );
}

function IntegrationsView({ integrations, orgId, onSaved }: {
  integrations: Integration[]; orgId: string | null; onSaved: () => void;
}) {
  const PROVIDERS: { id: Integration['provider']; label: string; desc: string; category: string }[] = [
    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o for AI responses', category: 'AI' },
    { id: 'gemini', label: 'Google Gemini', desc: 'Alternative AI provider', category: 'AI' },
    { id: 'google_calendar', label: 'Google Calendar', desc: 'Real-time appointment booking', category: 'Calendar' },
    { id: 'stripe', label: 'Stripe', desc: 'Accept payments and subscriptions', category: 'Payments' },
    { id: 'twilio', label: 'Twilio', desc: 'Phone number provisioning and calls', category: 'Telephony' },
    { id: 'resend', label: 'Resend', desc: 'Transactional email notifications', category: 'Email' },
  ];
  const categories = Array.from(new Set(PROVIDERS.map((p) => p.category)));
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggle = async (provider: Integration['provider']) => {
    if (!orgId) return;
    setConnecting(provider);
    const existing = integrations.find((i) => i.provider === provider);
    if (existing) {
      const newStatus = existing.status === 'connected' ? 'disconnected' : 'connected';
      await supabase.from('integrations').update({ status: newStatus, connected_at: newStatus === 'connected' ? new Date().toISOString() : null }).eq('id', existing.id);
    } else {
      await supabase.from('integrations').insert({ org_id: orgId, provider, status: 'connected', connected_at: new Date().toISOString() });
    }
    setConnecting(null);
    onSaved();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Integration Hub</h2>
        <p className="mt-1 text-sm text-gray-400">Connect external services. Credentials are encrypted and stored securely.</p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{cat}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROVIDERS.filter((p) => p.category === cat).map((p) => {
              const integration = integrations.find((i) => i.provider === p.id);
              const connected = integration?.status === 'connected';
              return (
                <div key={p.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{p.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{p.desc}</p>
                    </div>
                    {connected ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : integration?.status === 'error' ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <XCircle className="h-5 w-5 text-gray-600" />}
                  </div>
                  <button onClick={() => toggle(p.id)} disabled={connecting === p.id} className={`mt-5 w-full rounded-xl py-2.5 text-sm font-medium transition ${connected ? 'border border-white/10 bg-white/[0.02] text-gray-300 hover:border-red-500/30 hover:text-red-300' : 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950 hover:scale-[1.02]'}`}>
                    {connecting === p.id ? '…' : connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SetupCenterView({ org, agent, integrations, kb }: {
  org: Organization | null; agent: AIAgent | null; integrations: Integration[]; kb: KnowledgeBaseEntry[];
}) {
  const steps = [
    { id: 'business', label: 'Business', icon: Building2, desc: 'Organization profile', done: !!org },
    { id: 'employee', label: 'AI Employee', icon: Bot, desc: 'Create your first AI agent', done: !!agent && agent.status === 'active' },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen, desc: 'Upload business info', done: kb.length > 0 },
    { id: 'voice', label: 'Voice', icon: Zap, desc: 'Configure voice provider', done: integrations.some((i) => i.provider === 'openai' && i.status === 'connected') },
    { id: 'calendar', label: 'Calendar', icon: Calendar, desc: 'Connect Google Calendar', done: integrations.some((i) => i.provider === 'google_calendar' && i.status === 'connected') },
    { id: 'telephony', label: 'Telephony', icon: Phone, desc: 'Connect Twilio', done: integrations.some((i) => i.provider === 'twilio' && i.status === 'connected') },
    { id: 'payments', label: 'Payments', icon: CreditCard, desc: 'Configure payment methods', done: integrations.some((i) => i.provider === 'stripe' && i.status === 'connected') },
    { id: 'crm', label: 'CRM', icon: Users, desc: 'Set up lead pipeline', done: false },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white">Setup Center</h2>
      <p className="mt-1 text-sm text-gray-400">Guided onboarding. Complete each step to go live.</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(completed / steps.length) * 100}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
        </div>
        <span className="text-sm font-medium text-gold-300">{completed} / {steps.length} complete</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div key={s.id} whileHover={{ y: -3 }} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-gray-400'}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{s.label}</h3>
            <p className="text-xs text-gray-500">{s.desc}</p>
            <div className="mt-3 flex items-center gap-1.5">
              {s.done ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span className="text-[10px] uppercase tracking-wider text-emerald-400">Complete</span></> : <><XCircle className="h-3.5 w-3.5 text-gray-600" /><span className="text-[10px] uppercase tracking-wider text-gray-600">Not started</span></>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BillingView({ sub, org }: { sub: Subscription | null; org: Organization | null }) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-7">
        <h2 className="font-display text-xl font-bold text-white">Current plan</h2>
        {sub ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoBox label="Plan" value={sub.plan} />
            <InfoBox label="Billing cycle" value={sub.billing_cycle} />
            <InfoBox label="Status" value={sub.status} />
            <InfoBox label="Currency" value={sub.currency} />
            {sub.trial_ends_at && <InfoBox label="Trial ends" value={new Date(sub.trial_ends_at).toLocaleDateString()} />}
            {sub.current_period_end && <InfoBox label="Current period ends" value={new Date(sub.current_period_end).toLocaleDateString()} />}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">You're on a free trial. Upgrade to keep your AI employee running after the trial ends.</p>
        )}
        <div className="mt-6 flex gap-3">
          <button className="btn-gold">Upgrade plan</button>
          <button className="btn-ghost">View invoices</button>
        </div>
      </div>
      {org && (
        <div className="glass rounded-2xl p-7">
          <h3 className="font-display text-lg font-semibold text-white">Organization details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <InfoBox label="Name" value={org.name} />
            <InfoBox label="Country" value={org.country} />
            <InfoBox label="Currency" value={org.currency} />
            <InfoBox label="Industry" value={org.industry ?? '—'} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold capitalize text-white">{value}</p>
    </div>
  );
}
