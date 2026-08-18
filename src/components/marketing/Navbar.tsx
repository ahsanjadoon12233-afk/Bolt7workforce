import { useState, useEffect } from 'react';
import { Menu, X, Bot } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-navy-950/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex items-center justify-between px-6 py-4 md:px-12">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-display text-sm font-bold tracking-wide text-white">
            THE 7 <span className="gradient-text">WORKFORCE</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-gray-400 transition hover:text-gold-300">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href="#/signin" className="text-sm font-medium text-gray-300 transition hover:text-white">Sign in</a>
          <a href="#/signup" className="btn-gold !px-5 !py-2.5 !text-xs">Get started</a>
        </div>

        <button onClick={() => setOpen(!open)} className="text-white md:hidden">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-navy-950/95 px-6 py-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-gray-300">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3">
              <a href="#/signin" className="btn-ghost flex-1 !py-2.5 !text-xs">Sign in</a>
              <a href="#/signup" className="btn-gold flex-1 !py-2.5 !text-xs">Get started</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
