import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/marketing/Navbar';
import MarketingSite from '@/components/marketing/MarketingSite';
import AuthScreens from '@/components/auth/AuthScreens';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';
import ClientPortal from '@/components/dashboard/ClientPortal';
import { Loader2 } from 'lucide-react';

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#/, '') || '/');
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export default function App() {
  const { user, role, loading } = useAuth();
  const route = useHashRoute();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  const isAuthRoute = route === '/signin' || route === '/signup';
  const isDashboardRoute = route === '/dashboard' || route === '/portal';

  if (isAuthRoute) {
    if (user && role) {
      window.location.hash = role === 'owner' ? '#/dashboard' : '#/portal';
      return null;
    }
    return <AuthScreens mode={route === '/signup' ? 'signup' : 'signin'} />;
  }

  if (isDashboardRoute) {
    if (!user) {
      window.location.hash = '#/signin';
      return null;
    }
    if (role === 'owner') return <OwnerDashboard />;
    return <ClientPortal />;
  }

  if (user && role) {
    window.location.hash = role === 'owner' ? '#/dashboard' : '#/portal';
    return null;
  }

  return (
    <>
      <Navbar />
      <MarketingSite />
    </>
  );
}
