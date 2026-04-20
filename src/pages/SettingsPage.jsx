import { useNavigate } from 'react-router-dom';
import { LocateFixed } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useUserPrefs } from '../context/UserPrefsContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useUserLocation } from '../context/UserLocationContext.jsx';

const BLUE = '#139ED2';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[5px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="font-medium text-slate-900">{label}</div>
        {description ? <div className="mt-0.5 text-sm text-slate-500">{description}</div> : null}
      </div>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 rounded-[3px] border-slate-300"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { prefs, update } = useUserPrefs();
  const { clearAllPersonal } = useFavorites();
  const { usingGps, status, refreshLocation, coords } = useUserLocation();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <PageHeader title="Indstillinger" onBack={() => navigate('/profile')} />
      <div className="space-y-4 p-4 pb-28">
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Placering</h2>
          <div className="space-y-2 rounded-[5px] border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              Din placering bruges til at sortere steder efter afstand og vise rigtige kilometer/meter. Den
              gemmes kortvarigt i denne fane (session), så du ikke skal give tilladelse ved hvert klik.
            </p>
            <p className="text-sm font-medium text-slate-800">
              {usingGps
                ? `Aktiv GPS (ca. ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                : status === 'denied'
                  ? 'Placering er blokeret — afstande bruger København som udgangspunkt.'
                  : 'Ingen GPS endnu — afstande bruger København som udgangspunkt.'}
            </p>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-[5px] py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: BLUE }}
              disabled={status === 'loading'}
              onClick={() =>
                refreshLocation().catch(() =>
                  window.alert('Tillad placering i browseren under webstedets tilladelser.')
                )
              }
            >
              <LocateFixed className="h-4 w-4" />
              {status === 'loading' ? 'Henter placering…' : 'Opdater min placering'}
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Notifikationer</h2>
          <div className="space-y-2">
            <ToggleRow
              label="Tips på e-mail"
              description="Sjældne opdateringer om nye refill-steder (demo — ingen e-mails sendes)."
              checked={prefs.tipsEmail}
              onChange={(v) => update({ tipsEmail: v })}
            />
            <ToggleRow
              label="Produktnyheder"
              description="Når vi udvider med nye kategorier eller funktioner."
              checked={prefs.productNews}
              onChange={(v) => update({ productNews: v })}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Tilgængelighed</h2>
          <div className="space-y-2">
            <ToggleRow
              label="Reducer bevægelse"
              description="Mindre animationer i grænsefladen (hvor understøttet)."
              checked={prefs.reduceMotion}
              onChange={(v) => update({ reduceMotion: v })}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Privatliv</h2>
          <div className="space-y-2">
            <ToggleRow
              label="Hjælp med at forbedre appen"
              description="Anonym brugsstatistik (demo — slået fra som standard)."
              checked={prefs.shareAnalytics}
              onChange={(v) => update({ shareAnalytics: v })}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Data</h2>
          <p className="mb-2 text-sm text-slate-600">
            Favoritter, seneste steder og indstillinger gemmes i FillUps database på serveren og knyttes til
            din bruger. «Ryd data» nulstiller det for din konto (ikke selve login).
          </p>
          <button
            type="button"
            className="w-full rounded-[5px] border border-red-200 bg-white py-3 text-sm font-semibold text-red-700 shadow-sm"
            onClick={() => {
              if (window.confirm('Slet gemte steder, historik og nulstil indstillinger for din konto?')) {
                void clearAllPersonal();
              }
            }}
          >
            Ryd mine app-data
          </button>
        </section>

        <p className="text-center text-xs text-slate-400">FillUp · version 0.1</p>
      </div>
    </div>
  );
}
