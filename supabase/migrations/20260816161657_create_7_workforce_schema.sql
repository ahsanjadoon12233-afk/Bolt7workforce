/*
# THE 7 WORKFORCE — Core Platform Schema

## Purpose
Multi-tenant SaaS platform selling AI receptionist "digital employees" to businesses.
One Owner account controls the whole platform; each Client business is scoped strictly
to its own organization via Row Level Security.

## New Tables
1. profiles — extends auth.users; stores role (owner/client) + org membership
2. organizations — business clients (name, country, currency, industry, plan, status, trial dates)
3. ai_agents — per-client AI receptionist config
4. knowledge_base — content entries tied to an agent
5. leads — captured prospects
6. integrations — per-client connection status + encrypted credentials
7. subscriptions — plan, billing cycle, currency, status, trial dates, stripe ids
8. appointments — booked slots linked to calendar events
9. audit_logs — actor, action, entity, timestamp

## Security
- RLS enabled on every table.
- Helper SECURITY DEFINER functions read the caller's role + org.
- Owner role can access all tenant rows; Client role only rows where org_id = current_user_org_id().

## Important Notes
1. Tables created first, then helper functions, then policies (functions reference profiles).
2. All tenant tables carry org_id referencing organizations(id) ON DELETE CASCADE.
3. Encrypted credentials stored as text; encryption applied server-side by edge functions.
*/

-- ---------------------------------------------------------------------------
-- organizations (created first because profiles references it)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_contact_email text,
  country text NOT NULL DEFAULT 'US',
  currency text NOT NULL DEFAULT 'USD',
  industry text,
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','pro','enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled','trialing')),
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('owner','client')),
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- ai_agents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'AI Receptionist',
  personality text,
  tone text DEFAULT 'professional',
  language text NOT NULL DEFAULT 'en',
  supported_languages text[] NOT NULL DEFAULT ARRAY['en'],
  greeting text,
  business_description text,
  services text,
  hours text,
  capabilities text[] NOT NULL DEFAULT ARRAY['answer_questions','book_appointments','capture_leads'],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','draft')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- knowledge_base
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  source text DEFAULT 'ai_chat',
  qualification_score integer DEFAULT 0,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','lost')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- integrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('openai','gemini','google_calendar','stripe','twilio','email','resend')),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error')),
  credentials_encrypted text,
  metadata jsonb,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, provider)
);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','pro','enterprise')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','trialing','past_due','cancelled','suspended')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed','pending')),
  calendar_event_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, bypass RLS, read-only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner');
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_owner" ON public.profiles;
CREATE POLICY "profiles_select_own_or_owner" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_platform_owner());

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- organizations policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "orgs_select_owner_or_member" ON public.organizations;
CREATE POLICY "orgs_select_owner_or_member" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR id = public.current_user_org_id());

DROP POLICY IF EXISTS "orgs_insert_owner" ON public.organizations;
CREATE POLICY "orgs_insert_owner" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner());

DROP POLICY IF EXISTS "orgs_update_owner_or_member" ON public.organizations;
CREATE POLICY "orgs_update_owner_or_member" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR id = public.current_user_org_id());

DROP POLICY IF EXISTS "orgs_delete_owner" ON public.organizations;
CREATE POLICY "orgs_delete_owner" ON public.organizations
  FOR DELETE TO authenticated
  USING (public.is_platform_owner());

-- ---------------------------------------------------------------------------
-- ai_agents policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "agents_select_owner_or_member" ON public.ai_agents;
CREATE POLICY "agents_select_owner_or_member" ON public.ai_agents
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "agents_insert_owner_or_member" ON public.ai_agents;
CREATE POLICY "agents_insert_owner_or_member" ON public.ai_agents
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "agents_update_owner_or_member" ON public.ai_agents;
CREATE POLICY "agents_update_owner_or_member" ON public.ai_agents
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "agents_delete_owner_or_member" ON public.ai_agents;
CREATE POLICY "agents_delete_owner_or_member" ON public.ai_agents
  FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- knowledge_base policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "kb_select_owner_or_member" ON public.knowledge_base;
CREATE POLICY "kb_select_owner_or_member" ON public.knowledge_base
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "kb_insert_owner_or_member" ON public.knowledge_base;
CREATE POLICY "kb_insert_owner_or_member" ON public.knowledge_base
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "kb_update_owner_or_member" ON public.knowledge_base;
CREATE POLICY "kb_update_owner_or_member" ON public.knowledge_base
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "kb_delete_owner_or_member" ON public.knowledge_base;
CREATE POLICY "kb_delete_owner_or_member" ON public.knowledge_base
  FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- leads policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "leads_select_owner_or_member" ON public.leads;
CREATE POLICY "leads_select_owner_or_member" ON public.leads
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "leads_insert_owner_or_member" ON public.leads;
CREATE POLICY "leads_insert_owner_or_member" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "leads_update_owner_or_member" ON public.leads;
CREATE POLICY "leads_update_owner_or_member" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "leads_delete_owner_or_member" ON public.leads;
CREATE POLICY "leads_delete_owner_or_member" ON public.leads
  FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- integrations policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "integrations_select_owner_or_member" ON public.integrations;
CREATE POLICY "integrations_select_owner_or_member" ON public.integrations
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "integrations_insert_owner_or_member" ON public.integrations;
CREATE POLICY "integrations_insert_owner_or_member" ON public.integrations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "integrations_update_owner_or_member" ON public.integrations;
CREATE POLICY "integrations_update_owner_or_member" ON public.integrations
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "integrations_delete_owner_or_member" ON public.integrations;
CREATE POLICY "integrations_delete_owner_or_member" ON public.integrations
  FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- subscriptions policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "subs_select_owner_or_member" ON public.subscriptions;
CREATE POLICY "subs_select_owner_or_member" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "subs_insert_owner_or_member" ON public.subscriptions;
CREATE POLICY "subs_insert_owner_or_member" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "subs_update_owner_or_member" ON public.subscriptions;
CREATE POLICY "subs_update_owner_or_member" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "subs_delete_owner_or_member" ON public.subscriptions;
CREATE POLICY "subs_delete_owner_or_member" ON public.subscriptions
  FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- appointments policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "appts_select_owner_or_member" ON public.appointments;
CREATE POLICY "appts_select_owner_or_member" ON public.appointments
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "appts_insert_owner_or_member" ON public.appointments;
CREATE POLICY "appts_insert_owner_or_member" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "appts_update_owner_or_member" ON public.appointments;
CREATE POLICY "appts_update_owner_or_member" ON public.appointments
  FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id())
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "appts_delete_owner_or_member" ON public.appointments;
CREATE POLICY "appts_delete_owner_or_member" ON public.appointments
  FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- audit_logs policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_select_owner_or_member" ON public.audit_logs;
CREATE POLICY "audit_select_owner_or_member" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

DROP POLICY IF EXISTS "audit_insert_owner_or_member" ON public.audit_logs;
CREATE POLICY "audit_insert_owner_or_member" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- Indexes for common queries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_agents_org_id ON public.ai_agents(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON public.integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org_id ON public.appointments(org_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_at ON public.appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_agent_id ON public.knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_ai_agents_updated_at ON public.ai_agents;
CREATE TRIGGER trg_ai_agents_updated_at BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER trg_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_integrations_updated_at ON public.integrations;
CREATE TRIGGER trg_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
