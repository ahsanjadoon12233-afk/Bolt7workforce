export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  tagline: string;
  color: string;
  capabilities: string[];
  languages: string[];
  voice: string;
  status: string;
}

export const AI_EMPLOYEES: AIEmployee[] = [
  { id: 'aria', name: 'ARIA', role: 'AI Receptionist', tagline: 'Your front desk, always available.', color: '#d4af37', capabilities: ['Calls', 'Chat', 'Appointments', 'Lead Capture', 'CRM'], languages: ['EN', 'UR', 'AR', 'ES'], voice: 'Warm · Female · Neutral', status: 'ACTIVE' },
  { id: 'nova', name: 'NOVA', role: 'AI Sales', tagline: 'Closes while you sleep.', color: '#4fc3f7', capabilities: ['Qualification', 'Quotes', 'Follow-ups', 'CRM Sync'], languages: ['EN', 'UR', 'AR'], voice: 'Confident · Female · Neutral', status: 'ACTIVE' },
  { id: 'maya', name: 'MAYA', role: 'AI Support', tagline: 'Answers before you can.', color: '#66bb6a', capabilities: ['FAQ', 'Troubleshooting', 'Tickets', 'Escalation'], languages: ['EN', 'ES', 'AR'], voice: 'Calm · Female · Neutral', status: 'IDLE' },
  { id: 'kai', name: 'KAI', role: 'AI Recruiting', tagline: 'Finds the right people.', color: '#ab47bc', capabilities: ['Screening', 'Scheduling', 'Outreach', 'Notes'], languages: ['EN', 'UR'], voice: 'Professional · Male · Neutral', status: 'ACTIVE' },
  { id: 'zen', name: 'ZEN', role: 'AI Scheduler', tagline: 'Never double-books again.', color: '#ff7043', capabilities: ['Calendar', 'Reminders', 'Rescheduling', 'Conflicts'], languages: ['EN', 'AR', 'ES'], voice: 'Precise · Neutral', status: 'ACTIVE' },
  { id: 'rex', name: 'REX', role: 'AI Dispatcher', tagline: 'Routes and dispatches instantly.', color: '#ef5350', capabilities: ['Routing', 'Dispatch', 'Status Updates', 'GPS'], languages: ['EN', 'UR'], voice: 'Direct · Male · Neutral', status: 'IDLE' },
  { id: 'echo', name: 'ECHO', role: 'Custom AI', tagline: 'Build anything you imagine.', color: '#78909c', capabilities: ['Custom Workflow', 'API', 'Webhooks', 'Integrations'], languages: ['EN', 'UR', 'AR', 'ES'], voice: 'Adaptive · Neutral', status: 'DRAFT' },
];

export interface Industry {
  id: string;
  name: string;
  icon: string;
  specialties: string[];
  recommendedEmployees: string[];
}

export const INDUSTRIES: Industry[] = [
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', specialties: ['Dental', 'Medical', 'Pediatric', 'Dermatology'], recommendedEmployees: ['aria', 'zen'] },
  { id: 'realestate', name: 'Real Estate', icon: 'Home', specialties: ['Residential', 'Commercial', 'Property Management'], recommendedEmployees: ['nova', 'aria'] },
  { id: 'hvac', name: 'HVAC', icon: 'Wind', specialties: ['Installation', 'Repair', 'Maintenance'], recommendedEmployees: ['rex', 'zen'] },
  { id: 'plumbing', name: 'Plumbing', icon: 'Wrench', specialties: ['Emergency', 'Installation', 'Inspection'], recommendedEmployees: ['rex', 'aria'] },
  { id: 'legal', name: 'Legal', icon: 'Scale', specialties: ['Law Firm', 'Intake', 'Consultation'], recommendedEmployees: ['aria', 'kai'] },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', specialties: ['Claims', 'Quotes', 'Renewals'], recommendedEmployees: ['nova', 'maya'] },
  { id: 'recruiting', name: 'Recruiting', icon: 'Users', specialties: ['Agency', 'Corporate', 'Executive Search'], recommendedEmployees: ['kai', 'zen'] },
  { id: 'homeservices', name: 'Home Services', icon: 'Home', specialties: ['Cleaning', 'Repair', 'Installation'], recommendedEmployees: ['rex', 'aria'] },
];

export interface Template {
  id: string;
  name: string;
  industry: string;
  role: string;
  description: string;
  personality: string;
  tools: string[];
  workflow: string[];
}

export const TEMPLATES: Template[] = [
  { id: 'dental-receptionist', name: 'Dental Receptionist', industry: 'Healthcare', role: 'Receptionist', description: 'Books cleanings, handles emergency calls, answers insurance questions.', personality: 'Warm, reassuring, professional', tools: ['Calendar', 'CRM', 'Knowledge'], workflow: ['Greet', 'Identify need', 'Check calendar', 'Book appointment', 'Send confirmation'] },
  { id: 'medical-receptionist', name: 'Medical Receptionist', industry: 'Healthcare', role: 'Receptionist', description: 'Schedules appointments, verifies insurance, handles patient queries.', personality: 'Calm, empathetic, precise', tools: ['Calendar', 'CRM', 'Knowledge'], workflow: ['Greet', 'Verify patient', 'Schedule', 'Confirm'] },
  { id: 'realestate-lead', name: 'Real Estate Lead Agent', industry: 'Real Estate', role: 'Sales', description: 'Qualifies buyers, schedules viewings, follows up on inquiries.', personality: 'Enthusiastic, knowledgeable, persistent', tools: ['CRM', 'Calendar', 'Knowledge'], workflow: ['Qualify lead', 'Match properties', 'Schedule viewing', 'Follow up'] },
  { id: 'hvac-dispatcher', name: 'HVAC Dispatcher', industry: 'HVAC', role: 'Dispatcher', description: 'Dispatches technicians, handles emergency calls, tracks status.', personality: 'Direct, efficient, calm under pressure', tools: ['Dispatch', 'GPS', 'Calendar'], workflow: ['Receive call', 'Assess urgency', 'Dispatch tech', 'Update status'] },
  { id: 'plumbing-booking', name: 'Plumbing Booking Agent', industry: 'Plumbing', role: 'Scheduler', description: 'Books service calls, handles emergencies, provides estimates.', personality: 'Quick, practical, helpful', tools: ['Calendar', 'Knowledge'], workflow: ['Identify issue', 'Check availability', 'Book slot', 'Send ETA'] },
  { id: 'law-firm-intake', name: 'Law Firm Intake Agent', industry: 'Legal', role: 'Receptionist', description: 'Screens potential clients, schedules consultations, captures case details.', personality: 'Professional, discreet, thorough', tools: ['CRM', 'Calendar', 'Knowledge'], workflow: ['Screen client', 'Capture case info', 'Schedule consult', 'Notify attorney'] },
  { id: 'recruiting-coordinator', name: 'Recruiting Coordinator', industry: 'Recruiting', role: 'Recruiting', description: 'Screens candidates, schedules interviews, sends follow-ups.', personality: 'Professional, encouraging, organized', tools: ['CRM', 'Calendar', 'Email'], workflow: ['Screen resume', 'Schedule interview', 'Send prep', 'Follow up'] },
];

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  region: string;
  status: 'available' | 'configured' | 'not-configured';
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'raast', name: 'Raast', type: 'Bank Transfer', region: 'Pakistan', status: 'not-configured' },
  { id: 'jazzcash', name: 'JazzCash', type: 'Mobile Wallet', region: 'Pakistan', status: 'not-configured' },
  { id: 'easypaisa', name: 'Easypaisa', type: 'Mobile Wallet', region: 'Pakistan', status: 'not-configured' },
  { id: 'nayapay', name: 'NayaPay', type: 'Mobile Wallet', region: 'Pakistan', status: 'not-configured' },
  { id: 'sadapay', name: 'SadaPay', type: 'Card', region: 'Pakistan', status: 'not-configured' },
  { id: 'bank-transfer', name: 'Bank Transfer', type: 'IBAN', region: 'Global', status: 'not-configured' },
  { id: 'cards', name: 'Cards (Stripe)', type: 'International', region: 'Global', status: 'not-configured' },
  { id: 'qr', name: 'QR Payment', type: 'QR Code', region: 'Global', status: 'not-configured' },
];

export const SCENARIOS = [
  { id: 'book', label: 'Book Appointment', icon: 'Calendar' },
  { id: 'ask', label: 'Ask a Question', icon: 'HelpCircle' },
  { id: 'quote', label: 'Get a Quote', icon: 'DollarSign' },
  { id: 'reschedule', label: 'Reschedule', icon: 'Clock' },
  { id: 'human', label: 'Request Human', icon: 'User' },
  { id: 'payment', label: 'Payment Question', icon: 'CreditCard' },
];

export const INDUSTRY_OPTIONS = [
  'Healthcare', 'Real Estate', 'HVAC', 'Plumbing', 'Legal', 'Insurance', 'Recruiting', 'Home Services', 'Other',
];

export const SPECIALTY_OPTIONS: Record<string, string[]> = {
  Healthcare: ['Dental', 'Medical', 'Pediatric', 'Dermatology'],
  'Real Estate': ['Residential', 'Commercial', 'Property Management'],
  HVAC: ['Installation', 'Repair', 'Maintenance'],
  Plumbing: ['Emergency', 'Installation', 'Inspection'],
  Legal: ['Law Firm', 'Intake', 'Consultation'],
  Insurance: ['Claims', 'Quotes', 'Renewals'],
  Recruiting: ['Agency', 'Corporate', 'Executive Search'],
  'Home Services': ['Cleaning', 'Repair', 'Installation'],
  Other: ['General'],
};
