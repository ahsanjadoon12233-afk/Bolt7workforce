import { useState, FormEvent } from 'react';
import { Mail, MapPin, Phone, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', company: '', country: 'United States', message: '' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', email: '', company: '', country: 'United States', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Let's talk</h2>
        <p className="mt-4 text-gray-400">
          Whether you're a clinic in Karachi, a law firm in Dubai, or a salon in Madrid — we'll deploy an AI
          receptionist that speaks your customers' language and books while you sleep.
        </p>
        <div className="mt-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-sm text-gray-400">hello@the7workforce.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Phone</p>
              <p className="text-sm text-gray-400">+1 (415) 555-0199</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Headquarters</p>
              <p className="text-sm text-gray-400">Remote-first · serving 40+ countries</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="glass rounded-2xl p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Work email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-gray-400">How can we help?</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-gold-400/50"
            placeholder="Tell us about your business and what you need…"
          />
        </div>
        <button type="submit" disabled={status === 'loading'} className="btn-gold mt-5 w-full">
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-4 w-4" />}
          {status === 'idle' && 'Send message'}
          {status === 'loading' && 'Sending…'}
          {status === 'success' && 'Sent! We\'ll be in touch'}
          {status === 'error' && 'Try again'}
        </button>
        {status === 'error' && (
          <p className="mt-3 text-center text-sm text-red-400">Something went wrong. Please email us directly.</p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-gold-400/50"
      />
    </div>
  );
}
