import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Organization, Lead, AuditLog, Integration, Subscription, AIAgent, Conversation, Call } from '@/lib/types';
import { AI_EMPLOYEES } from '@/lib/catalog';
import {
  Building2, Users, TrendingUp, DollarSign, Globe, LogOut, Bot, Plug, CheckCircle2,
  XCircle, AlertTriangle, Search, ChevronRight, Activity, Shield, Crown, Phone,
  MessageSquare, Calendar, Zap, BarChart3, Bell, Menu, X, Settings, BookOpen,
  Workflow, CreditCard, Layers, Sparkles, ArrowRight, PlayCircle, Clock,
} from 'lucide-react';

const WorkforceCore = lazy(() => import('@/components/3d/WorkforceCore'));

type Tab =
  | 'overview' | 'clients' | 'integrations' | 'audit'
  | 'conversations' | 'employees' | 'analytics' | 'setup' | 'templates' | 'industries';

export default function OwnerDashboard() {
  const { signOut, user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [o, l, a, i, s, au, c, ca] = await Promise.all([
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('ai_agents').select('*'),
      supabase.from('integrations').select('*'),
      supabase.from('subscriptions').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('conversations').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('calls').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setOrgs((o.data as Organization[]) ?? []);
    setLeads((l.data as Lead[]) ?? []);
    setAgents((a.data as AIAgent[]) ?? []);
    setIntegrations((i.data as Integration[]) ?? []);
    setSubs((s.data as Subscription[]) ?? []);
    setAudit((au.data as AuditLog[]) ?? []);
    setConversations((c.data as Conversation[]) ?? []);
    setCalls((ca.data as Call[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const countries = Array.from(new Set(orgs.map((o) => o.country)));
  const filteredOrgs = orgs.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCountry !== 'all' && o.country !== filterCountry) return false;
    if (filterPlan !== 'all' && o.plan !== filterPlan) return false;
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    return true;
  });

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const activeSubs = subs.filter((s) => s.status === 'active' || s.status === 'trialing').length;
  const trialSubs = subs.filter((s) => s.status === 'trialing').length;
  const mrr = subs
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.plan === 'enterprise' ? 499 : s.plan === 'pro' ? 149 : s.plan === 'starter' ? 49 : 0), 0);
  const byCountry: Record<string, number> = {};
  orgs.forEach((o) => { byCountry[o.country] = (byCountry[o.country] ?? 0) + 1; });

  const NAV_GROUPS: { label: string; items: { id: Tab; label: string; icon: typeof Bot }[] }[] = [
    { label: 'Command', items: [
      { id: 'overview', label: 'Overview', icon: Activity },
      { id: 'conversations', label: 'Conversations', icon: MessageSquare },
      { id: 'employees', label: 'AI Employees', icon: Bot },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]},
    { label: 'Platform', items: [
      { id: 'clients', label: 'Businesses', icon: Building2 },
      { id: 'integrations', label: 'Integrations', icon: Plug },
      { id: 'templates', label: 'Templates', icon: Layers },
      { id: 'industries', label: 'Industries', icon: Globe },
      { id: 'setup', label: 'Setup Center', icon: Settings },
      { id: 'audit', label: 'Audit Log', icon: Shield },
    ]},
  ];

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/10 bg-navy-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xs font-bold text-white">THE 7 WORKFORCE</p>
            <p className="text-[9px] uppercase tracking-wider text-gold-300">Owner Control Center</p>
          </div>
        </div>
        <nav className="flex flex-col gap-6 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
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
                {user?.email?.[0]?.toUpperCase() ?? 'O'}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{user?.email}</p>
                <p className="text-[10px] text-gold-300">Owner</p>
              </div>
            </div>
            <button onClick={signOut} className="text-gray-500 transition hover:text-red-400">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-navy-950/80 px-6 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg font-bold capitalize text-white">{tab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 transition hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold-400" />
            </button>
            <a href="#/" className="btn-ghost !px-4 !py-2 !text-xs">
              <Globe className="h-3.5 w-3.5" /> View Site
            </a>
          </div>
        </header>

        <main className="p-6 md:p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <Activity className="h-6 w-6 animate-pulse" /> <span className="ml-3">Loading command center…</span>
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
                {tab === 'overview' && <Overview orgs={orgs} leads={leads} conversations={conversations} calls={calls} agents={agents} activeAgents={activeAgents} activeSubs={activeSubs} trialSubs={trialSubs} mrr={mrr} byCountry={byCountry} />}
                {tab === 'conversations' && <ConversationsView conversations={conversations} calls={calls} />}
                {tab === 'employees' && <EmployeesView agents={agents} orgs={orgs} />}
                {tab === 'analytics' && <AnalyticsView orgs={orgs} leads={leads} conversations={conversations} calls={calls} subs={subs} />}
                {tab === 'clients' && <Clients orgs={filteredOrgs} leads={leads} agents={agents} subs={subs} search={search} setSearch={setSearch} filterCountry={filterCountry} setFilterCountry={setFilterCountry} filterPlan={filterPlan} setFilterPlan={setFilterPlan} filterStatus={filterStatus} setFilterStatus={setFilterStatus} countries={countries} selectedOrg={selectedOrg} setSelectedOrg={setSelectedOrg} />}
                {tab === 'integrations' && <Integrations integrations={integrations} />}
                {tab === 'templates' && <TemplatesView />}
                {tab === 'industries' && <IndustriesView />}
                {tab === 'setup' && <SetupCenter />}
                {tab === 'audit' && <AuditLogView audit={audit} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: string | number; sub?: string; color: string;
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

function Overview({ orgs, leads, conversations, calls, agents, activeAgents, activeSubs, trialSubs, mrr, byCountry }: {
  orgs: Organization[]; leads: Lead[]; conversations: Conversation[]; calls: Call[]; agents: AIAgent[];
  activeAgents: number; activeSubs: number; trialSubs: number; mrr: number; byCountry: Record<string, number>;
}) {
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const churned = orgs.filter((o) => o.status === 'cancelled').length;
  const churnRate = orgs.length ? ((churned / orgs.length) * 100).toFixed(1) : '0';
  const resolvedConvs = conversations.filter((c) => c.status === 'resolved').length;
  const resolutionRate = conversations.length ? ((resolvedConvs / conversations.length) * 100).toFixed(0) : '—';
  const todayCalls = calls.filter((c) => new Date(c.created_at).toDateString() === new Date().toDateString()).length;
  const todayConvs = conversations.filter((c) => new Date(c.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-8">
      {/* Workforce status 3D */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-navy-900/40">
          <Suspense fallback={<div className="flex h-full items-center justify-center"><Sparkles className="h-6 w-6 animate-pulse text-gold-400" /></div>}>
            <WorkforceCore onSelectEmployee={() => {}} />
          </Suspense>
          <div className="pointer-events-none absolute left-5 top-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">Workforce Status</p>
            <p className="font-display text-2xl font-bold text-white">{activeAgents} AI Employees Active</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard icon={Bot} label="AI Employees Active" value={activeAgents} color="bg-gold-400/15 text-gold-300" />
          <MetricCard icon={MessageSquare} label="Conversations Today" value={todayConvs} color="bg-blue-500/15 text-blue-300" />
          <MetricCard icon={Phone} label="Calls Today" value={todayCalls} color="bg-purple-500/15 text-purple-300" />
          <MetricCard icon={TrendingUp} label="AI Resolution Rate" value={resolutionRate === '—' ? '—' : `${resolutionRate}%`} color="bg-emerald-500/15 text-emerald-300" />
        </div>
      </div>

      {/* Core metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Building2} label="Total businesses" value={orgs.length} color="bg-blue-500/15 text-blue-300" />
        <MetricCard icon={Users} label="Total leads" value={leads.length} sub={`${newLeads} new`} color="bg-emerald-500/15 text-emerald-300" />
        <MetricCard icon={DollarSign} label="MRR" value={`$${mrr.toLocaleString()}`} sub={`${activeSubs} paid · ${trialSubs} trial`} color="bg-gold-400/15 text-gold-300" />
        <MetricCard icon={XCircle} label="Churn rate" value={`${churnRate}%`} sub={`${churned} cancelled`} color="bg-red-500/15 text-red-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Globe className="h-5 w-5 text-gold-300" /> Businesses by country
          </h3>
          <div className="mt-5 space-y-3">
            {Object.entries(byCountry).length === 0 ? (
              <p className="text-sm text-gray-500">No businesses yet.</p>
            ) : (
              Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => {
                const pct = (count / orgs.length) * 100;
                return (
                  <div key={country}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{country}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Activity className="h-5 w-5 text-gold-300" /> Recent activity
          </h3>
          <div className="mt-5 space-y-2">
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
                  c.status === 'escalated' ? 'bg-orange-500/15 text-orange-300' :
                  'bg-blue-500/15 text-blue-300'
                }`}>{c.status}</span>
              </div>
            ))}
            {conversations.length === 0 && <p className="text-sm text-gray-500">No conversations yet.</p>}
          </div>
        </div>
      </div>
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
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
              channel === ch ? 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950' : 'border border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <motion.div key={c.id} whileHover={{ x: 4 }} className="flex items-center justify-between rounded-2xl glass p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
                {c.channel === 'voice' ? <Phone className="h-5 w-5" /> : c.channel === 'email' ? <MessageSquare className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold text-white">{c.customer_name ?? 'Unknown customer'}</p>
                <p className="text-xs text-gray-500">{c.channel} · {c.customer_contact ?? '—'} · {c.intent ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                c.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-300' :
                c.status === 'escalated' ? 'bg-orange-500/15 text-orange-300' :
                c.status === 'transferred' ? 'bg-purple-500/15 text-purple-300' :
                c.status === 'closed' ? 'bg-gray-500/15 text-gray-400' :
                'bg-blue-500/15 text-blue-300'
              }`}>{c.status}</span>
              <span className="text-xs text-gray-600">{new Date(c.created_at).toLocaleString()}</span>
              <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:border-gold-400/30 hover:text-gold-300">Open</button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="flex h-40 items-center justify-center text-gray-500">
            <p>No conversations yet. {conversations.length === 0 ? 'Your AI employees haven\'t had any conversations yet.' : 'Try a different channel filter.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeesView({ agents, orgs }: { agents: AIAgent[]; orgs: Organization[] }) {
  const orgMap = new Map(orgs.map((o) => [o.id, o.name]));
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">{agents.length} AI employees across {orgs.length} businesses</p>
        <button className="btn-gold !py-2.5 !text-xs"><Sparkles className="h-3.5 w-3.5" /> Create AI Employee</button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {AI_EMPLOYEES.map((emp) => {
          const orgAgents = agents.filter((a) => a.name.toLowerCase().includes(emp.name.toLowerCase()) || a.name.toLowerCase().includes(emp.role.toLowerCase().replace('ai ', '')));
          return (
            <motion.div key={emp.id} whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110" style={{ backgroundColor: `${emp.color}15`, border: `1px solid ${emp.color}30` }}>
                <Bot className="h-7 w-7" style={{ color: emp.color }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{emp.name}</h3>
              <p className="text-sm font-medium" style={{ color: emp.color }}>{emp.role}</p>
              <p className="mt-2 text-xs text-gray-500">"{emp.tagline}"</p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">{emp.status}</span>
              </div>
              <p className="mt-3 text-xs text-gray-600">{orgAgents.length} deployed</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsView({ orgs, leads, conversations, calls, subs }: {
  orgs: Organization[]; leads: Lead[]; conversations: Conversation[]; calls: Call[]; subs: Subscription[];
}) {
  const [range, setRange] = useState('30');
  const resolved = conversations.filter((c) => c.status === 'resolved').length;
  const escalated = conversations.filter((c) => c.status === 'escalated').length;
  const resolutionRate = conversations.length ? ((resolved / conversations.length) * 100).toFixed(0) : '—';
  const missedCalls = calls.filter((c) => c.status === 'missed').length;
  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const avgDuration = calls.length ? Math.round(calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / calls.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Analytics Center</h2>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {['Today', '7', '30', '90'].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${range === r ? 'bg-gold-400/20 text-gold-300' : 'text-gray-400 hover:text-white'}`}>
              {r === 'Today' ? 'Today' : `${r}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={MessageSquare} label="Total conversations" value={conversations.length} color="bg-blue-500/15 text-blue-300" />
        <MetricCard icon={Phone} label="Total calls" value={calls.length} sub={`${missedCalls} missed`} color="bg-purple-500/15 text-purple-300" />
        <MetricCard icon={TrendingUp} label="Resolution rate" value={resolutionRate === '—' ? '—' : `${resolutionRate}%`} color="bg-emerald-500/15 text-emerald-300" />
        <MetricCard icon={Users} label="Total leads" value={leads.length} color="bg-gold-400/15 text-gold-300" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={CheckCircle2} label="Resolved" value={resolved} color="bg-emerald-500/15 text-emerald-300" />
        <MetricCard icon={AlertTriangle} label="Escalated" value={escalated} color="bg-orange-500/15 text-orange-300" />
        <MetricCard icon={Phone} label="Completed calls" value={completedCalls} color="bg-blue-500/15 text-blue-300" />
        <MetricCard icon={Clock} label="Avg call duration" value={`${avgDuration}s`} color="bg-gray-500/15 text-gray-300" />
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
        <p className="mt-1 text-sm text-gray-400">Performance evaluation of your AI workforce.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Listen', value: '—' },
            { label: 'Understand', value: '—' },
            { label: 'Respond', value: '—' },
            { label: 'Help', value: '—' },
            { label: 'Protect', value: '—' },
            { label: 'Remember', value: '—' },
            { label: 'Grow', value: '—' },
            { label: 'Resolution', value: resolutionRate === '—' ? '—' : `${resolutionRate}%` },
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

function Clients({ orgs, leads, agents, subs, search, setSearch, filterCountry, setFilterCountry, filterPlan, setFilterPlan, filterStatus, setFilterStatus, countries, selectedOrg, setSelectedOrg }: {
  orgs: Organization[]; leads: Lead[]; agents: AIAgent[]; subs: Subscription[];
  search: string; setSearch: (v: string) => void;
  filterCountry: string; setFilterCountry: (v: string) => void;
  filterPlan: string; setFilterPlan: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  countries: string[];
  selectedOrg: Organization | null; setSelectedOrg: (o: Organization | null) => void;
}) {
  if (selectedOrg) {
    const orgLeads = leads.filter((l) => l.org_id === selectedOrg.id);
    const orgAgents = agents.filter((a) => a.org_id === selectedOrg.id);
    const orgSub = subs.find((s) => s.org_id === selectedOrg.id);
    return (
      <div>
        <button onClick={() => setSelectedOrg(null)} className="mb-5 flex items-center gap-2 text-sm text-gray-400 hover:text-gold-300">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to businesses
        </button>
        <div className="glass rounded-2xl p-7">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">{selectedOrg.name}</h2>
              <p className="mt-1 text-sm text-gray-400">{selectedOrg.country} · {selectedOrg.currency} · {selectedOrg.industry ?? '—'}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              selectedOrg.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' :
              selectedOrg.status === 'trialing' ? 'bg-blue-500/15 text-blue-300' :
              selectedOrg.status === 'suspended' ? 'bg-orange-500/15 text-orange-300' : 'bg-red-500/15 text-red-300'
            }`}>{selectedOrg.status}</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/[0.02] p-4"><p className="text-xs text-gray-500">Plan</p><p className="mt-1 font-semibold capitalize text-white">{selectedOrg.plan}</p></div>
            <div className="rounded-xl bg-white/[0.02] p-4"><p className="text-xs text-gray-500">Agents</p><p className="mt-1 font-semibold text-white">{orgAgents.length}</p></div>
            <div className="rounded-xl bg-white/[0.02] p-4"><p className="text-xs text-gray-500">Leads</p><p className="mt-1 font-semibold text-white">{orgLeads.length}</p></div>
          </div>
          {orgSub && <div className="mt-4 rounded-xl bg-white/[0.02] p-4"><p className="text-xs text-gray-500">Subscription</p><p className="mt-1 text-sm capitalize text-white">{orgSub.plan} · {orgSub.billing_cycle} · {orgSub.status}</p></div>}
          <h3 className="mt-7 font-display text-lg font-semibold text-white">Agents</h3>
          <div className="mt-3 space-y-2">
            {orgAgents.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3">
                <div><p className="text-sm font-medium text-white">{a.name}</p><p className="text-xs text-gray-500">{a.language} · {a.capabilities.length} capabilities</p></div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${a.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-500/15 text-gray-400'}`}>{a.status}</span>
              </div>
            ))}
            {orgAgents.length === 0 && <p className="text-sm text-gray-500">No agents configured.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search businesses…" className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-400/50" />
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
          <option value="all" className="bg-navy-900">All countries</option>
          {countries.map((c) => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
        </select>
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
          <option value="all" className="bg-navy-900">All plans</option>
          {['trial','starter','pro','enterprise'].map((p) => <option key={p} value={p} className="bg-navy-900 capitalize">{p}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50">
          <option value="all" className="bg-navy-900">All statuses</option>
          {['active','trialing','suspended','cancelled'].map((s) => <option key={s} value={s} className="bg-navy-900 capitalize">{s}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {orgs.map((o) => {
          const orgLeads = leads.filter((l) => l.org_id === o.id).length;
          const orgAgents = agents.filter((a) => a.org_id === o.id).length;
          return (
            <button key={o.id} onClick={() => setSelectedOrg(o)} className="flex w-full items-center justify-between rounded-2xl glass p-5 text-left transition hover:border-gold-400/30">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300"><Building2 className="h-5 w-5" /></div>
                <div><p className="font-semibold text-white">{o.name}</p><p className="text-xs text-gray-500">{o.country} · {o.currency} · {o.industry ?? '—'}</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-right sm:block"><p className="text-xs text-gray-500">Leads</p><p className="text-sm font-medium text-white">{orgLeads}</p></div>
                <div className="hidden text-right sm:block"><p className="text-xs text-gray-500">Agents</p><p className="text-sm font-medium text-white">{orgAgents}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${o.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : o.status === 'trialing' ? 'bg-blue-500/15 text-blue-300' : o.status === 'suspended' ? 'bg-orange-500/15 text-orange-300' : 'bg-red-500/15 text-red-300'}`}>{o.status}</span>
                <span className="rounded-full bg-gold-400/10 px-3 py-1 text-xs font-semibold capitalize text-gold-300">{o.plan}</span>
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </div>
            </button>
          );
        })}
        {orgs.length === 0 && <div className="flex h-40 items-center justify-center text-gray-500"><p>No businesses have signed up yet.</p></div>}
      </div>
    </div>
  );
}

function Integrations({ integrations }: { integrations: Integration[] }) {
  const PROVIDERS: { id: Integration['provider']; label: string; desc: string; category: string }[] = [
    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o for AI responses', category: 'AI' },
    { id: 'gemini', label: 'Google Gemini', desc: 'Alternative AI provider', category: 'AI' },
    { id: 'google_calendar', label: 'Google Calendar', desc: 'Appointment booking', category: 'Calendar' },
    { id: 'stripe', label: 'Stripe', desc: 'Payment processing', category: 'Payments' },
    { id: 'twilio', label: 'Twilio', desc: 'Phone call handling', category: 'Telephony' },
    { id: 'resend', label: 'Resend', desc: 'Transactional email', category: 'Email' },
  ];
  const categories = Array.from(new Set(PROVIDERS.map((p) => p.category)));
  const launchChecklist = PROVIDERS.map((p) => ({ provider: p.id, connected: integrations.some((i) => i.provider === p.id && i.status === 'connected') }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Launch checklist</h2>
        <p className="mt-1 text-sm text-gray-400">Platform-wide integration status.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {launchChecklist.map((c) => (
            <div key={c.provider} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${c.connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
              {c.connected ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {PROVIDERS.find((p) => p.id === c.provider)?.label ?? c.provider}
            </div>
          ))}
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{cat}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROVIDERS.filter((p) => p.category === cat).map((p) => {
              const integration = integrations.find((i) => i.provider === p.id);
              const connected = integration?.status === 'connected';
              return (
                <div key={p.id} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div><p className="text-sm font-semibold text-white">{p.label}</p><p className="text-xs text-gray-500">{p.desc}</p></div>
                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${connected ? 'bg-emerald-500/15 text-emerald-300' : integration?.status === 'error' ? 'bg-red-500/15 text-red-300' : 'bg-gray-500/15 text-gray-400'}`}>
                      {connected ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {integration?.status ?? 'not-configured'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplatesView() {
  const { TEMPLATES } = require('@/lib/catalog');
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white">Template Library</h2>
      <p className="mt-1 text-sm text-gray-400">Ready-made AI employee templates. Deploy in one click.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t: any) => (
          <motion.div key={t.id} whileHover={{ y: -4 }} className="glass rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300"><Layers className="h-6 w-6" /></div>
            <h3 className="mt-4 font-semibold text-white">{t.name}</h3>
            <p className="text-xs text-gray-500">{t.industry} · {t.role}</p>
            <p className="mt-3 text-sm text-gray-400">{t.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {t.tools.map((tool: string) => <span key={tool} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-gray-400">{tool}</span>)}
            </div>
            <button className="btn-ghost mt-5 w-full !py-2 !text-xs">Use template</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function IndustriesView() {
  const { INDUSTRIES } = require('@/lib/catalog');
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white">Industry Center</h2>
      <p className="mt-1 text-sm text-gray-400">Industries, specialties, and recommended AI employees.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.map((ind: any) => (
          <motion.div key={ind.id} whileHover={{ y: -4 }} className="glass rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300"><Globe className="h-6 w-6" /></div>
            <h3 className="mt-4 font-semibold text-white">{ind.name}</h3>
            <p className="mt-2 text-xs text-gray-500">Specialties: {ind.specialties.join(', ')}</p>
            <p className="mt-2 text-xs text-gray-500">Recommended: {ind.recommendedEmployees.map((e: string) => e.toUpperCase()).join(', ')}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SetupCenter() {
  const steps = [
    { id: 'business', label: 'Business', icon: Building2, desc: 'Organization profile' },
    { id: 'employee', label: 'AI Employee', icon: Bot, desc: 'Create your first AI agent' },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen, desc: 'Upload business info' },
    { id: 'voice', label: 'Voice', icon: Zap, desc: 'Configure voice provider' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, desc: 'Connect Google Calendar' },
    { id: 'telephony', label: 'Telephony', icon: Phone, desc: 'Connect Twilio' },
    { id: 'payments', label: 'Payments', icon: CreditCard, desc: 'Configure payment methods' },
    { id: 'crm', label: 'CRM', icon: Users, desc: 'Set up lead pipeline' },
  ];
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white">Setup Center</h2>
      <p className="mt-1 text-sm text-gray-400">Guided onboarding. Complete each step to go live.</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: '0%' }} />
        </div>
        <span className="text-sm font-medium text-gold-300">0 / {steps.length} complete</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div key={s.id} whileHover={{ y: -3 }} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400"><s.icon className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-gray-600">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{s.label}</h3>
            <p className="text-xs text-gray-500">{s.desc}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-[10px] uppercase tracking-wider text-gray-600">Not started</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AuditLogView({ audit }: { audit: AuditLog[] }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white">Audit Log</h2>
      <p className="mt-1 text-sm text-gray-400">Every owner and client action, newest first.</p>
      <div className="mt-5 space-y-2">
        {audit.map((a) => (
          <div key={a.id} className="flex items-start justify-between rounded-lg bg-white/[0.02] px-5 py-3">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10 text-gold-300"><Shield className="h-4 w-4" /></div>
              <div><p className="text-sm font-medium text-white">{a.action}</p><p className="text-xs text-gray-500">{a.entity ?? '—'} · {a.details ? JSON.stringify(a.details).slice(0, 80) : ''}</p></div>
            </div>
            <span className="text-xs text-gray-600">{new Date(a.created_at).toLocaleString()}</span>
          </div>
        ))}
        {audit.length === 0 && <p className="text-sm text-gray-500">No audit entries yet.</p>}
      </div>
    </div>
  );
}
