import { ArrowLeft, CheckCircle2, Info, MapPin, Navigation, Package, Share2, Star } from 'lucide-react';
import FavoriteHeart from './FavoriteHeart.jsx';

const BLUE = '#139ED2';

async function sharePlace(place) {
  const url = `${window.location.origin}/places/${place.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: place.name, text: `${place.name} — ${place.address}`, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    window.alert('Link kopieret til udklipsholder.');
  } catch (e) {
    if (e?.name === 'AbortError') return;
    try {
      await navigator.clipboard.writeText(url);
      window.alert('Link kopieret til udklipsholder.');
    } catch {
      window.prompt('Kopiér link:', url);
    }
  }
}

export default function PlaceDetailScreen({
  place,
  onBack,
  favoriteActive,
  onToggleFavorite,
}) {
  if (!place) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-white px-2 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[5px] p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Tilbage"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="line-clamp-1 min-w-0 flex-1 text-lg font-bold text-slate-900">{place.name}</h2>
        <div className="flex shrink-0 items-center">
          {onToggleFavorite && (
            <FavoriteHeart active={favoriteActive} onToggle={onToggleFavorite} />
          )}
          <button
            type="button"
            className="rounded-[5px] p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Del sted"
            onClick={() => sharePlace(place)}
          >
            <Share2 className="h-5 w-5" style={{ color: BLUE }} />
          </button>
        </div>
      </div>

      <div className="h-44 w-full" style={{ background: `linear-gradient(135deg, ${BLUE}, #0b7ead)` }}>
        <div className="flex h-full flex-col justify-end p-4 text-white">
          <h1 className="text-2xl font-bold">{place.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
            <MapPin className="h-4 w-4" />
            {place.address}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
              <Navigation className="mx-auto mb-1 h-5 w-5" style={{ color: BLUE }} />
              <div className="text-sm font-semibold text-slate-900">{place.distanceLabel ?? '—'}</div>
              <div className="text-[11px] text-slate-500">Afstand</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
              <Star className="mx-auto mb-1 h-5 w-5 text-amber-500" />
              <div className="text-sm font-semibold text-slate-900">{place.rating ?? '—'}</div>
              <div className="text-[11px] text-slate-500">Vurdering</div>
            </div>
            <a
              className="rounded-[5px] p-3 text-center text-white shadow-sm ring-1 ring-black/5"
              style={{ backgroundColor: BLUE }}
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="mx-auto mb-1 h-5 w-5" />
              <div className="text-sm font-semibold">Find vej</div>
            </a>
          </div>
          <p className="mt-4 flex gap-2 text-sm leading-relaxed text-slate-600">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            {place.description}
          </p>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Package className="h-5 w-5" style={{ color: BLUE }} />
            Produkter
          </h3>
          <div className="space-y-3">
            {place.products.map((product, idx) => (
              <div
                key={`${product.name}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="min-w-0">
                  <h4 className="font-medium text-slate-900">{product.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{product.price}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {product.category}
                  </span>
                  {product.inStock ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> På lager
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-red-500">Udsolgt p.t.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
