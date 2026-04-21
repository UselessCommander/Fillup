import { ChevronRight, MapPin, Navigation } from 'lucide-react';
import FavoriteHeart from './FavoriteHeart.jsx';

const BLUE = '#139ED2';

export default function HomeScreen({
  places,
  loading,
  error,
  onSelectPlace,
  isFavorite,
  onToggleFavorite,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex-1 bg-white px-4 pb-28 pt-5">
        <h3 className="text-lg font-bold text-slate-900">Refill i dit område</h3>
        <p className="mt-1 text-sm text-slate-600">
          Tryk på et sted for at se produkter og afstand — perfekt til shampoo, vaskemiddel og mere.
        </p>

        {loading && <p className="mt-6 text-sm text-slate-500">Henter steder…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-5 space-y-3">
            {places.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlace(p)}
                className="flex w-full items-stretch gap-3 rounded-[5px] border border-slate-100 bg-slate-50/80 p-3 text-left shadow-sm transition hover:border-slate-200 hover:bg-white active:scale-[0.99]"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[5px] text-white"
                  style={{ backgroundColor: BLUE }}
                >
                  <MapPin className="h-7 w-7 opacity-90" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="truncate font-semibold text-slate-900">{p.name}</h4>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {onToggleFavorite && (
                        <FavoriteHeart
                          active={isFavorite?.(p.id)}
                          onToggle={() => onToggleFavorite(p.id)}
                        />
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{p.address}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {p.distanceLabel && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-white"
                        style={{ backgroundColor: BLUE }}
                      >
                        <Navigation className="h-3 w-3" />
                        {p.distanceLabel}
                      </span>
                    )}
                    <span className="rounded-full bg-white px-2 py-1 font-medium text-slate-600 ring-1 ring-slate-200">
                      {p.productSummary}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {places.length === 0 && (
              <p className="text-sm text-slate-600">Ingen steder matcher dit filter. Prøv at nulstille.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
