export type UserRole = 'owner' | 'client';

export type Plan = 'trial' | 'starter' | 'pro' | 'enterprise';
export type OrgStatus = 'active' | 'suspended' | 'cancelled' | 'trialing';
export type AgentStatus = 'active' | 'paused' | 'draft';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type IntegrationProvider =
  | 'openai'
  | 'gemini'
  | 'google_calendar'
  | 'stripe'
  | 'twilio'
  | 'email'
  | 'resend';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'suspended';
export type BillingCycle = 'monthly' | 'yearly';
export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed' | 'pending';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  org_id: string | null;
  full_name: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_contact_email: string | null;
  country: string;
  currency: string;
  industry: string | null;
  plan: Plan;
  status: OrgStatus;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAgent {
  id: string;
  org_id: string;
  name: string;
  personality: string | null;
  tone: string | null;
  language: string;
  supported_languages: string[];
  greeting: string | null;
  business_description: string | null;
  services: string | null;
  hours: string | null;
  capabilities: string[];
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  agent_id: string;
  org_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  org_id: string;
  agent_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  qualification_score: number;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  org_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  credentials_encrypted: string | null;
  metadata: Record<string, unknown> | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  plan: Plan;
  billing_cycle: BillingCycle;
  currency: string;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  org_id: string;
  agent_id: string | null;
  lead_id: string | null;
  title: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  calendar_event_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  org_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  org_id: string;
  agent_id: string | null;
  lead_id: string | null;
  customer_id: string | null;
  channel: 'chat' | 'voice' | 'sms' | 'email' | 'whatsapp';
  intent: string | null;
  status: 'active' | 'resolved' | 'escalated' | 'closed' | 'transferred';
  outcome: string | null;
  customer_name: string | null;
  customer_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  org_id: string;
  role: 'user' | 'assistant' | 'system' | 'human';
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Call {
  id: string;
  org_id: string;
  agent_id: string | null;
  conversation_id: string | null;
  phone_number: string | null;
  direction: 'inbound' | 'outbound';
  duration_seconds: number;
  status: 'ringing' | 'in_progress' | 'completed' | 'missed' | 'failed' | 'transferred';
  outcome: string | null;
  transcript: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  org_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  lifetime_value: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  org_id: string;
  customer_id: string | null;
  lead_id: string | null;
  provider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  reference: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  org_id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
