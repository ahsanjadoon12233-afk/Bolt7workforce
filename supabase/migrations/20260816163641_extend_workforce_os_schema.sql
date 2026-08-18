/*
# THE 7 WORKFORCE — Extended Schema (Workforce OS)

## Purpose
Extend the core platform with entities for the full AI Workforce Operating System.

## New Tables
1. industries — industry catalog
2. specialties — specialties under industries
3. ai_templates — ready-made AI employee templates
4. feature_flags — platform feature toggles
5. customers — converted/known customers
6. conversations — unified communication sessions
7. messages — individual messages within a conversation
8. calls — phone call records
9. ai_employee_versions — version history for AI agent configs
10. workflows — visual workflow definitions
11. workflow_steps — ordered steps within a workflow
12. voice_providers — voice synthesis provider configs
13. telephony_providers — telephony provider configs
14. payment_providers — payment provider configs (per org)
15. payment_transactions — payment records
16. notifications — in-app notifications

## Security
- RLS enabled on every new table.
- Owner role: full access across all orgs.
- Client role: only rows where org_id = current_user_org_id().
- Catalog tables readable by all authenticated users.

## Important Notes
- customers created BEFORE conversations (conversations references customers).
- All tenant tables carry org_id referencing organizations(id) ON DELETE CASCADE.
*/

-- ---------------------------------------------------------------------------
-- Catalog tables (shared, readable by all authenticated)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id uuid NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text NOT NULL,
  role text NOT NULL,
  description text,
  personality text,
  tools text[] NOT NULL DEFAULT ARRAY[]::text[],
  workflow text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tenant tables (customers first — conversations references it)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  notes text,
  lifetime_value numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'chat' CHECK (channel IN ('chat','voice','sms','email','whatsapp')),
  intent text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','escalated','closed','transferred')),
  outcome text,
  customer_name text,
  customer_contact text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system','human')),
  content text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  phone_number text,
  direction text NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound','outbound')),
  duration_seconds integer DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('ringing','in_progress','completed','missed','failed','transferred')),
  outcome text,
  transcript text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_employee_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  config_snapshot jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  trigger text NOT NULL DEFAULT 'customer_call',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','draft')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  action text NOT NULL,
  config jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voice_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('elevenlabs','azure','google','aws','custom')),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error')),
  credentials_encrypted text,
  metadata jsonb,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.telephony_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('twilio','vonage','custom')),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error')),
  credentials_encrypted text,
  phone_numbers text[] NOT NULL DEFAULT ARRAY[]::text[],
  metadata jsonb,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('stripe','raast','jazzcash','easypaisa','nayapay','sadapay','bank_transfer','qr','cards')),
  status text NOT NULL DEFAULT 'not-configured' CHECK (status IN ('configured','not-configured','error')),
  credentials_encrypted text,
  metadata jsonb,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, provider)
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  provider text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded','cancelled')),
  reference text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Enable RLS on all new tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_employee_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telephony_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Catalog policies (readable by all authenticated; writable by owner)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "catalog_select_all" ON public.industries;
CREATE POLICY "catalog_select_all" ON public.industries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "catalog_insert_owner" ON public.industries;
CREATE POLICY "catalog_insert_owner" ON public.industries FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner());
DROP POLICY IF EXISTS "catalog_update_owner" ON public.industries;
CREATE POLICY "catalog_update_owner" ON public.industries FOR UPDATE TO authenticated USING (public.is_platform_owner()) WITH CHECK (public.is_platform_owner());

DROP POLICY IF EXISTS "specialties_select_all" ON public.specialties;
CREATE POLICY "specialties_select_all" ON public.specialties FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "specialties_insert_owner" ON public.specialties;
CREATE POLICY "specialties_insert_owner" ON public.specialties FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner());
DROP POLICY IF EXISTS "specialties_update_owner" ON public.specialties;
CREATE POLICY "specialties_update_owner" ON public.specialties FOR UPDATE TO authenticated USING (public.is_platform_owner()) WITH CHECK (public.is_platform_owner());

DROP POLICY IF EXISTS "templates_select_all" ON public.ai_templates;
CREATE POLICY "templates_select_all" ON public.ai_templates FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "templates_insert_owner" ON public.ai_templates;
CREATE POLICY "templates_insert_owner" ON public.ai_templates FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner());
DROP POLICY IF EXISTS "templates_update_owner" ON public.ai_templates;
CREATE POLICY "templates_update_owner" ON public.ai_templates FOR UPDATE TO authenticated USING (public.is_platform_owner()) WITH CHECK (public.is_platform_owner());

DROP POLICY IF EXISTS "flags_select_all" ON public.feature_flags;
CREATE POLICY "flags_select_all" ON public.feature_flags FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "flags_insert_owner" ON public.feature_flags;
CREATE POLICY "flags_insert_owner" ON public.feature_flags FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner());
DROP POLICY IF EXISTS "flags_update_owner" ON public.feature_flags;
CREATE POLICY "flags_update_owner" ON public.feature_flags FOR UPDATE TO authenticated USING (public.is_platform_owner()) WITH CHECK (public.is_platform_owner());

-- ---------------------------------------------------------------------------
-- Tenant table policies (owner-all, client-own-org)
-- ---------------------------------------------------------------------------

-- conversations
DROP POLICY IF EXISTS "conv_select" ON public.conversations;
CREATE POLICY "conv_select" ON public.conversations FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "conv_insert" ON public.conversations;
CREATE POLICY "conv_insert" ON public.conversations FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "conv_update" ON public.conversations;
CREATE POLICY "conv_update" ON public.conversations FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "conv_delete" ON public.conversations;
CREATE POLICY "conv_delete" ON public.conversations FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- messages
DROP POLICY IF EXISTS "msg_select" ON public.messages;
CREATE POLICY "msg_select" ON public.messages FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "msg_insert" ON public.messages;
CREATE POLICY "msg_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "msg_update" ON public.messages;
CREATE POLICY "msg_update" ON public.messages FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "msg_delete" ON public.messages;
CREATE POLICY "msg_delete" ON public.messages FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- calls
DROP POLICY IF EXISTS "calls_select" ON public.calls;
CREATE POLICY "calls_select" ON public.calls FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "calls_insert" ON public.calls;
CREATE POLICY "calls_insert" ON public.calls FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "calls_update" ON public.calls;
CREATE POLICY "calls_update" ON public.calls FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "calls_delete" ON public.calls;
CREATE POLICY "calls_delete" ON public.calls FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- customers
DROP POLICY IF EXISTS "cust_select" ON public.customers;
CREATE POLICY "cust_select" ON public.customers FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "cust_insert" ON public.customers;
CREATE POLICY "cust_insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "cust_update" ON public.customers;
CREATE POLICY "cust_update" ON public.customers FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "cust_delete" ON public.customers;
CREATE POLICY "cust_delete" ON public.customers FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ai_employee_versions
DROP POLICY IF EXISTS "aiev_select" ON public.ai_employee_versions;
CREATE POLICY "aiev_select" ON public.ai_employee_versions FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "aiev_insert" ON public.ai_employee_versions;
CREATE POLICY "aiev_insert" ON public.ai_employee_versions FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "aiev_delete" ON public.ai_employee_versions;
CREATE POLICY "aiev_delete" ON public.ai_employee_versions FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- workflows
DROP POLICY IF EXISTS "wf_select" ON public.workflows;
CREATE POLICY "wf_select" ON public.workflows FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "wf_insert" ON public.workflows;
CREATE POLICY "wf_insert" ON public.workflows FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "wf_update" ON public.workflows;
CREATE POLICY "wf_update" ON public.workflows FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "wf_delete" ON public.workflows;
CREATE POLICY "wf_delete" ON public.workflows FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- workflow_steps
DROP POLICY IF EXISTS "wfs_select" ON public.workflow_steps;
CREATE POLICY "wfs_select" ON public.workflow_steps FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "wfs_insert" ON public.workflow_steps;
CREATE POLICY "wfs_insert" ON public.workflow_steps FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "wfs_update" ON public.workflow_steps;
CREATE POLICY "wfs_update" ON public.workflow_steps FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "wfs_delete" ON public.workflow_steps;
CREATE POLICY "wfs_delete" ON public.workflow_steps FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- voice_providers
DROP POLICY IF EXISTS "vp_select" ON public.voice_providers;
CREATE POLICY "vp_select" ON public.voice_providers FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "vp_insert" ON public.voice_providers;
CREATE POLICY "vp_insert" ON public.voice_providers FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "vp_update" ON public.voice_providers;
CREATE POLICY "vp_update" ON public.voice_providers FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "vp_delete" ON public.voice_providers;
CREATE POLICY "vp_delete" ON public.voice_providers FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- telephony_providers
DROP POLICY IF EXISTS "tp_select" ON public.telephony_providers;
CREATE POLICY "tp_select" ON public.telephony_providers FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "tp_insert" ON public.telephony_providers;
CREATE POLICY "tp_insert" ON public.telephony_providers FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "tp_update" ON public.telephony_providers;
CREATE POLICY "tp_update" ON public.telephony_providers FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "tp_delete" ON public.telephony_providers;
CREATE POLICY "tp_delete" ON public.telephony_providers FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- payment_providers
DROP POLICY IF EXISTS "pp_select" ON public.payment_providers;
CREATE POLICY "pp_select" ON public.payment_providers FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "pp_insert" ON public.payment_providers;
CREATE POLICY "pp_insert" ON public.payment_providers FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "pp_update" ON public.payment_providers;
CREATE POLICY "pp_update" ON public.payment_providers FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "pp_delete" ON public.payment_providers;
CREATE POLICY "pp_delete" ON public.payment_providers FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- payment_transactions
DROP POLICY IF EXISTS "ptx_select" ON public.payment_transactions;
CREATE POLICY "ptx_select" ON public.payment_transactions FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "ptx_insert" ON public.payment_transactions;
CREATE POLICY "ptx_insert" ON public.payment_transactions FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "ptx_update" ON public.payment_transactions;
CREATE POLICY "ptx_update" ON public.payment_transactions FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "ptx_delete" ON public.payment_transactions;
CREATE POLICY "ptx_delete" ON public.payment_transactions FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- notifications
DROP POLICY IF EXISTS "notif_select" ON public.notifications;
CREATE POLICY "notif_select" ON public.notifications FOR SELECT TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "notif_insert" ON public.notifications;
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "notif_update" ON public.notifications;
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id()) WITH CHECK (public.is_platform_owner() OR org_id = public.current_user_org_id());
DROP POLICY IF EXISTS "notif_delete" ON public.notifications;
CREATE POLICY "notif_delete" ON public.notifications FOR DELETE TO authenticated USING (public.is_platform_owner() OR org_id = public.current_user_org_id());

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_org_id ON public.calls(org_id);
CREATE INDEX IF NOT EXISTS idx_customers_org_id ON public.customers(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_employee_versions_agent_id ON public.ai_employee_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON public.workflows(org_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON public.workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_voice_providers_org_id ON public.voice_providers(org_id);
CREATE INDEX IF NOT EXISTS idx_telephony_providers_org_id ON public.telephony_providers(org_id);
CREATE INDEX IF NOT EXISTS idx_payment_providers_org_id ON public.payment_providers(org_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_org_id ON public.payment_transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON public.notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ---------------------------------------------------------------------------
-- Triggers for updated_at on new tables
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_workflows_updated_at ON public.workflows;
CREATE TRIGGER trg_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_voice_providers_updated_at ON public.voice_providers;
CREATE TRIGGER trg_voice_providers_updated_at BEFORE UPDATE ON public.voice_providers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_telephony_providers_updated_at ON public.telephony_providers;
CREATE TRIGGER trg_telephony_providers_updated_at BEFORE UPDATE ON public.telephony_providers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_payment_providers_updated_at ON public.payment_providers;
CREATE TRIGGER trg_payment_providers_updated_at BEFORE UPDATE ON public.payment_providers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER trg_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER trg_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Seed catalog data
-- ---------------------------------------------------------------------------
INSERT INTO public.industries (name, icon) VALUES
  ('Healthcare', 'Heart'), ('Real Estate', 'Home'), ('HVAC', 'Wind'),
  ('Plumbing', 'Wrench'), ('Legal', 'Scale'), ('Insurance', 'Shield'),
  ('Recruiting', 'Users'), ('Home Services', 'Home')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.feature_flags (key, label, description, enabled) VALUES
  ('ai_chat', 'AI Chat', 'Enable AI chat conversations', true),
  ('voice_calls', 'Voice Calls', 'Enable AI voice call handling', false),
  ('multi_language', 'Multi-Language', 'Enable multi-language support', true),
  ('payment_center', 'Payment Center', 'Enable payment processing', false),
  ('workflow_builder', 'Workflow Builder', 'Enable visual workflow builder', true),
  ('voice_lab', 'Voice Lab', 'Enable voice synthesis lab', false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ai_templates (name, industry, role, description, personality, tools, workflow) VALUES
  ('Dental Receptionist', 'Healthcare', 'Receptionist', 'Books cleanings, handles emergency calls, answers insurance questions.', 'Warm, reassuring, professional', ARRAY['Calendar','CRM','Knowledge'], ARRAY['Greet','Identify need','Check calendar','Book appointment','Send confirmation']),
  ('Medical Receptionist', 'Healthcare', 'Receptionist', 'Schedules appointments, verifies insurance, handles patient queries.', 'Calm, empathetic, precise', ARRAY['Calendar','CRM','Knowledge'], ARRAY['Greet','Verify patient','Schedule','Confirm']),
  ('Real Estate Lead Agent', 'Real Estate', 'Sales', 'Qualifies buyers, schedules viewings, follows up on inquiries.', 'Enthusiastic, knowledgeable, persistent', ARRAY['CRM','Calendar','Knowledge'], ARRAY['Qualify lead','Match properties','Schedule viewing','Follow up']),
  ('HVAC Dispatcher', 'HVAC', 'Dispatcher', 'Dispatches technicians, handles emergency calls, tracks status.', 'Direct, efficient, calm under pressure', ARRAY['Dispatch','GPS','Calendar'], ARRAY['Receive call','Assess urgency','Dispatch tech','Update status']),
  ('Plumbing Booking Agent', 'Plumbing', 'Scheduler', 'Books service calls, handles emergencies, provides estimates.', 'Quick, practical, helpful', ARRAY['Calendar','Knowledge'], ARRAY['Identify issue','Check availability','Book slot','Send ETA']),
  ('Law Firm Intake Agent', 'Legal', 'Receptionist', 'Screens potential clients, schedules consultations, captures case details.', 'Professional, discreet, thorough', ARRAY['CRM','Calendar','Knowledge'], ARRAY['Screen client','Capture case info','Schedule consult','Notify attorney']),
  ('Recruiting Coordinator', 'Recruiting', 'Recruiting', 'Screens candidates, schedules interviews, sends follow-ups.', 'Professional, encouraging, organized', ARRAY['CRM','Calendar','Email'], ARRAY['Screen resume','Schedule interview','Send prep','Follow up'])
ON CONFLICT DO NOTHING;
