import { List, MapPinned, LocateFixed, Search } from 'lucide-react';
import { useUserLocation } from '../context/UserLocationContext.jsx';

const BLUE = '#139ED2';
const GREEN = '#94CF53';

function LocationHint() {
  const { usingGps, status, refreshLocation } = useUserLocation();

  const btnBase =
    'shrink-0 rounded-[5px] px-2 py-1 text-[11px] font-semibold underline decoration-white/70 underline-offset-2';

  if (status === 'loading') {
    return <span className="text-[11px] text-white/90">Finder din placering…</span>;
  }

  if (status === 'unsupported') {
    return (
      <span className="text-[11px] text-white/85">GPS er ikke tilgængelig — afstande fra København.</span>
    );
  }

  if (usingGps) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/95">
        <span className="inline-flex items-center gap-1">
          <LocateFixed className="h-3.5 w-3.5" />
          Din placering bruges til afstande
        </span>
        <button
          type="button"
          className={btnBase}
          onClick={() => refreshLocation().catch(() => {})}
        >
          Opdater
        </button>
      </div>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/95">
        <span>Placering ikke tilgængelig — afstande fra København.</span>
        <button
          type="button"
          className={btnBase}
          onClick={() =>
            refreshLocation().catch(() =>
              window.alert('Tillad placering i browserindstillinger for at se rigtige afstande.')
            )
          }
        >
          Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/95">
      <span>Afstande er fra København, indtil du deler GPS.</span>
      <button
        type="button"
        className={`${btnBase} bg-white/20 no-underline hover:bg-white/30`}
        onClick={() =>
          refreshLocation().catch(() =>
            window.alert('Tillad placering når browseren spørger — så matcher afstande dig.')
          )
        }
      >
        Brug min placering
      </button>
    </div>
  );
}

export default function SearchHeader({
  variant,
  searchValue,
  onSearchChange,
  onFilterClick,
  navTab,
  onGoList,
  onGoMap,
}) {
  const title =
    variant === 'home' ? (
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30"
          aria-hidden
        >
          <span className="h-5 w-5 rounded-full" style={{ background: GREEN }} />
        </span>
        <span className="text-lg font-semibold tracking-tight">Velkommen til FillUp!</span>
      </div>
    ) : (
      <p className="text-sm font-medium leading-snug text-white/95">
        Søg efter refill i nærheden i dit område
      </p>
    );

  const listActive = navTab === 'home';
  const mapActive = navTab === 'map';

  return (
    <div className="rounded-b-[28px] px-4 pb-5 pt-4 shadow-sm" style={{ backgroundColor: BLUE }}>
      <div className="mx-auto max-w-md space-y-4">
        {variant === 'home' ? <div className="text-white">{title}</div> : <div>{title}</div>}

        <div className="rounded-[5px] bg-black/10 px-3 py-2">
          <LocationHint />
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 shadow-inner outline-none ring-0 placeholder:text-slate-400 focus:ring-2 focus:ring-white/40"
              placeholder="København, Denmark"
              type="search"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={onFilterClick}
            className="shrink-0 rounded-[5px] px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm active:scale-[0.98]"
            style={{ backgroundColor: GREEN }}
          >
            Filtrer
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onGoList}
            className={`flex items-center justify-center gap-2 rounded-[5px] py-3 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
              listActive ? 'text-slate-900' : 'bg-white text-slate-700'
            }`}
            style={listActive ? { backgroundColor: GREEN } : {}}
          >
            <List className="h-4 w-4" />
            Liste
          </button>
          <button
            type="button"
            onClick={onGoMap}
            className={`flex items-center justify-center gap-2 rounded-[5px] py-3 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
              mapActive ? 'text-slate-900' : 'bg-white'
            }`}
            style={mapActive ? { backgroundColor: GREEN } : { color: BLUE }}
          >
            <MapPinned className="h-4 w-4" />
            Rutevejledning
          </button>
        </div>
      </div>
    </div>
  );
}
