import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

import SplashScreen from '../components/SplashScreen.jsx';

const BLUE = '#139ED2';
const GREEN = '#94CF53';

export default function AuthRegisterPage() {
  const { user, register, authReady } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);

  if (!authReady) {
    return <SplashScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Adgangskoderne matcher ikke.');
      return;
    }
    const res = await register(name, email, password);
    if (res.ok) navigate('/', { replace: true });
    else setError(res.error);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      <div
        className="relative px-6 pb-12 pt-16 text-white overflow-hidden"
        style={{ backgroundColor: BLUE }}
      >
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at top right, ${GREEN}, transparent)` }} />
        
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="absolute left-4 top-4 z-20 rounded-[5px] bg-white/15 p-2 text-white hover:bg-white/25"
          aria-label="Tilbage til log ind"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-2xl bg-white shadow-xl p-2 ring-4 ring-white/20">
            <img 
              src="/logo.png" 
              alt="FillUp Logo" 
              className="h-full w-full object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight drop-shadow-md">Opret bruger</h2>
          <p className="mt-2 text-[15px] text-white/90 drop-shadow-sm">Få adgang til dit digitale refill-kort gratis.</p>
        </div>
      </div>

      <div className="relative -mt-4 flex flex-1 flex-col px-4 pb-10">
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-md rounded-t-[20px] bg-white px-5 pb-8 pt-8 shadow-lg ring-1 ring-black/5"
        >
          <h1 className="text-lg font-bold text-slate-900">Opret bruger</h1>
          <p className="mt-1 text-sm text-slate-600">
            Brugeren oprettes i serverens database. Vælg en sikker adgangskode hvis appen kører offentligt.
          </p>

          {error && (
            <p className="mt-4 rounded-[5px] bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Navn
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-[#139ED2]/40"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
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
            Adgangskode (min. 6 tegn)
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-[#139ED2]/40"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Gentag adgangskode
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-[#139ED2]/40"
            />
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-[5px] py-3 text-sm font-semibold text-slate-900 shadow-sm"
            style={{ backgroundColor: GREEN }}
          >
            Opret bruger
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Har du allerede en bruger?{' '}
            <Link to="/login" className="font-semibold" style={{ color: BLUE }}>
              Log ind
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
