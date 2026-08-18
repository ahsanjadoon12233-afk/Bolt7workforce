import { useState, FormEvent } from 'react';
import { Bot, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Crown, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

type Mode = 'signin' | 'signup';

export default function AuthScreens({ mode }: { mode: Mode }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
      } else {
        const { error: err } = await signUp(email, password, fullName || 'Business Owner', role);
        if (err) setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Background orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <a href="#/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-bold text-white">THE 7 <span className="gradient-text">WORKFORCE</span></span>
        </a>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-400">
            {mode === 'signin' ? 'Sign in to your dashboard' : 'Start your 14-day free trial — no card required'}
          </p>

          {mode === 'signup' && (
            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-gray-400">Account type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                    role === 'client' ? 'border-gold-400/50 bg-gold-400/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <Building2 className={`h-6 w-6 ${role === 'client' ? 'text-gold-300' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium text-white">Business</span>
                  <span className="text-[10px] text-gray-500">Client portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                    role === 'owner' ? 'border-gold-400/50 bg-gold-400/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <Crown className={`h-6 w-6 ${role === 'owner' ? 'text-gold-300' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium text-white">Owner</span>
                  <span className="text-[10px] text-gray-500">Platform admin</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <InputField icon={User} label="Full name" value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
            )}
            <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@business.com" required />
            <InputField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required minLength={6} />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {mode === 'signin' ? (
              <>Don't have an account? <a href="#/signup" className="font-medium text-gold-300 hover:text-gold-200">Sign up</a></>
            ) : (
              <>Already have an account? <a href="#/signin" className="font-medium text-gold-300 hover:text-gold-200">Sign in</a></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  minLength,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-gold-400/50 focus:bg-white/[0.06]"
        />
      </div>
    </div>
  );
}
