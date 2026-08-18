import { useState } from 'react';
import { Check, Sparkles, Building2, Crown, Rocket } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  icon: typeof Sparkles;
  priceUSD: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Building2,
    priceUSD: 49,
    tagline: 'For solo businesses getting started with AI reception.',
    features: ['1 AI agent', '500 conversations / month', '2 languages', 'Lead capture', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Rocket,
    priceUSD: 149,
    tagline: 'For growing teams that need full automation.',
    features: ['3 AI agents', '5,000 conversations / month', 'All languages', 'Google Calendar booking', 'Stripe billing', 'Priority support', 'Custom knowledge base'],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    priceUSD: 499,
    tagline: 'For multi-location businesses at scale.',
    features: ['Unlimited agents', 'Unlimited conversations', 'All languages', 'Twilio phone integration', 'Dedicated manager', 'SLA + audit logs', 'White-label option'],
  },
];

const CURRENCIES: Record<string, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1, label: 'USD' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP' },
  PKR: { symbol: '₨', rate: 278, label: 'PKR' },
  AED: { symbol: 'د.إ', rate: 3.67, label: 'AED' },
  SAR: { symbol: '﷼', rate: 3.75, label: 'SAR' },
  INR: { symbol: '₹', rate: 83, label: 'INR' },
  EGP: { symbol: '£', rate: 48, label: 'EGP' },
};

export default function Pricing() {
  const [currency, setCurrency] = useState('USD');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const cur = CURRENCIES[currency];

  return (
    <div id="pricing">
      <div className="mb-12 flex flex-col items-center gap-6">
        <span className="eyebrow">Pricing</span>
        <h2 className="font-display text-center text-3xl font-bold text-white md:text-5xl">
          Pay in your currency. <span className="gradient-text">Scale on your terms.</span>
        </h2>
        <p className="max-w-2xl text-center text-gray-400">
          Every plan starts with a 14-day free trial. No credit card required. Cancel anytime.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {(['monthly', 'yearly'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition ${
                  cycle === c ? 'bg-gradient-to-r from-gold-300 to-gold-500 text-navy-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                {c}
                {c === 'yearly' && <span className="ml-1.5 text-xs opacity-80">−20%</span>}
              </button>
            ))}
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/50"
          >
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <option key={code} value={code} className="bg-navy-900">
                {c.label} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = plan.priceUSD * cur.rate * (cycle === 'yearly' ? 0.8 : 1);
          const display = price >= 100 ? Math.round(price).toLocaleString() : price.toFixed(0);
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-7 transition-all duration-300 ${
                plan.highlighted
                  ? 'glass-gold scale-[1.02] shadow-[0_0_48px_rgba(212,175,55,0.15)]'
                  : 'glass hover:border-gold-400/30'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-navy-950">
                  Most popular
                </span>
              )}
              <plan.icon className="h-8 w-8 text-gold-300" />
              <h3 className="mt-4 text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{plan.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">{cur.symbol}{display}</span>
                <span className="mb-1 text-sm text-gray-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`mt-7 w-full ${plan.highlighted ? 'btn-gold' : 'btn-ghost'}`}>
                Start free trial
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
