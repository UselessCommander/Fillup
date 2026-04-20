import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

import SplashScreen from '../components/SplashScreen.jsx';

const BLUE = '#139ED2';
const GREEN = '#94CF53';

export default function AuthLoginPage() {
  const { user, login, authReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rawFrom = location.state?.from;
  const from =
    typeof rawFrom === 'string' &&
    rawFrom !== '/login' &&
    rawFrom !== '/opret' &&
    !rawFrom.startsWith('/login') &&
    !rawFrom.startsWith('/opret')
      ? rawFrom
      : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (!authReady) {
    return <SplashScreen />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (res.ok) navigate(from, { replace: true });
    else setError(res.error);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      <div
        className="px-6 pb-12 pt-16 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: BLUE }}
      >
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at top right, ${GREEN}, transparent)` }} />
        
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
          <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white shadow-xl p-2 ring-4 ring-white/20">
            <img 
              src="/logo.png" 
              alt="FillUp Logo" 
              className="h-full w-full object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight drop-shadow-md">Velkommen tilbage</h2>
          <p className="mt-2 text-[15px] text-white/90 drop-shadow-sm">Log ind for at finde refill-steder nær dig.</p>
        </div>
      </div>

      <div className="relative -mt-6 flex flex-1 flex-col px-4 pb-10">
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-md rounded-t-[20px] bg-white px-5 pb-8 pt-8 shadow-lg ring-1 ring-black/5"
        >
          <h1 className="text-lg font-bold text-slate-900">Log ind</h1>
          <p className="mt-1 text-sm text-slate-600">
            Din bruger og data gemmes i en PostgreSQL-database (fx Supabase). Adgangskoder hashes med bcrypt.
            Brug ikke hemmelige koder i usikre demo-miljøer.
          </p>

          {error && (
            <p className="mt-4 rounded-[5px] bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <label className="mt-5 block text-sm font-medium text-slate-700">
            E-mail
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-[#139ED2]/40"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Adgangskode
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-[#139ED2]/40"
            />
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-[5px] py-3 text-sm font-semibold text-slate-900 shadow-sm"
            style={{ backgroundColor: GREEN }}
          >
            Log ind
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Har du ikke en bruger?{' '}
            <Link to="/opret" className="font-semibold" style={{ color: BLUE }}>
              Opret bruger
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
