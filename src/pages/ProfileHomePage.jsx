import { Link } from 'react-router-dom';
import {
  Heart,
  HelpCircle,
  History,
  Info,
  LogOut,
  MapPin,
  Settings,
  Shield,
  FileText,
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import MenuLinkRow from '../components/MenuLinkRow.jsx';

const BLUE = '#139ED2';

export default function ProfileHomePage() {
  const { favoriteIds, recent } = useFavorites();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
        <div className="border-b border-slate-100 bg-white px-4 pb-10 pt-16">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md mb-6"
              style={{ backgroundColor: BLUE }}
            >
              FU
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ikke logget ind</h1>
            <p className="text-slate-600 mb-8 px-4 leading-relaxed">
              Log ind for at gemme dine yndlings refill-steder, se din historik og tilpasse dine præferencer.
            </p>
            <Link
              to="/login"
              className="rounded-[5px] px-8 py-3.5 font-bold text-slate-900 shadow-md transition active:scale-[0.98]"
              style={{ backgroundColor: '#94CF53' }}
            >
              Log ind / Opret bruger
            </Link>
          </div>
        </div>

        <div className="space-y-6 p-4 pb-28">
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Support & Info</h2>
            <div className="space-y-2">
              <MenuLinkRow to="/profile/help" icon={HelpCircle} label="Hjælp & kontakt" />
              <MenuLinkRow to="/profile/about" icon={Info} label="Om FillUp" />
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Juridisk</h2>
            <div className="space-y-2">
              <MenuLinkRow to="/profile/privacy" icon={Shield} label="Privatlivspolitik" />
              <MenuLinkRow to="/profile/terms" icon={FileText} label="Vilkår for brug" />
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <div className="border-b border-slate-100 bg-white px-4 pb-6 pt-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md"
            style={{ backgroundColor: BLUE }}
          >
            FU
          </div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">
            {user?.name ? `Hej, ${user.name}` : 'FillUp'}
          </h1>
          {user?.email && <p className="mt-1 text-xs text-slate-500">{user.email}</p>}
          <p className="mt-1 max-w-xs text-sm text-slate-600">
            Mindre emballage i hverdagen — find refill nær dig.
          </p>
          <div className="mt-4 flex w-full max-w-sm gap-2">
            <div className="flex-1 rounded-[5px] bg-slate-50 py-2 text-center ring-1 ring-slate-100">
              <div className="text-lg font-bold text-slate-900">{favoriteIds.length}</div>
              <div className="text-[11px] text-slate-500">Gemte</div>
            </div>
            <div className="flex-1 rounded-[5px] bg-slate-50 py-2 text-center ring-1 ring-slate-100">
              <div className="text-lg font-bold text-slate-900">{recent.length}</div>
              <div className="text-[11px] text-slate-500">Seneste</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 pb-28">
        {recent.length > 0 && (
          <section>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <History className="h-4 w-4" />
              Senest set
            </h2>
            <div className="space-y-2">
              {recent.slice(0, 5).map((r) => (
                <Link
                  key={`${r.id}-${r.at}`}
                  to={`/places/${r.id}`}
                  className="flex items-center gap-3 rounded-[5px] border border-slate-100 bg-white px-3 py-2.5 text-sm shadow-sm"
                >
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: BLUE }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900">{r.name}</div>
                    <div className="truncate text-xs text-slate-500">{r.address}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Konto & data</h2>
          <div className="space-y-2">
            <MenuLinkRow to="/profile/favorites" icon={Heart} label="Gemte steder" hint="Dine favorit-refillsteder" />
            <MenuLinkRow to="/profile/settings" icon={Settings} label="Indstillinger" hint="Notifikationer og app-præferencer" />
            <button
              type="button"
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-[5px] border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-red-100 hover:bg-red-50/50 active:scale-[0.99]"
            >
              <LogOut className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">Log ud</div>
                <div className="text-xs text-slate-500">Afslut session på denne enhed</div>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Support</h2>
          <div className="space-y-2">
            <MenuLinkRow to="/profile/help" icon={HelpCircle} label="Hjælp & kontakt" />
            <MenuLinkRow to="/profile/about" icon={Info} label="Om FillUp" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Juridisk</h2>
          <div className="space-y-2">
            <MenuLinkRow to="/profile/privacy" icon={Shield} label="Privatlivspolitik" />
            <MenuLinkRow to="/profile/terms" icon={FileText} label="Vilkår for brug" />
          </div>
        </section>
      </div>
    </div>
  );
}
