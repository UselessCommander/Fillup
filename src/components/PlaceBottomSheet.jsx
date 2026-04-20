import { Navigation } from 'lucide-react';
import FavoriteHeart from './FavoriteHeart.jsx';

const BLUE = '#139ED2';

export default function PlaceBottomSheet({
  place,
  onClose,
  onDirections,
  onSeeProducts,
  favoriteActive,
  onToggleFavorite,
}) {
  if (!place) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: '#00000040' }}
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md animate-in slide-in-from-bottom duration-200">
        <div
          className="rounded-t-[28px] px-5 pb-8 pt-4 text-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: BLUE, paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/35" />
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold leading-tight">{place.name}</h2>
            {onToggleFavorite && (
              <FavoriteHeart
                active={favoriteActive}
                onToggle={onToggleFavorite}
                variant="onDark"
                className="shrink-0 bg-white/10 hover:bg-white/20"
                label="Gem sted"
              />
            )}
          </div>
          <p className="mt-1 text-sm text-white/90">{place.address}</p>
          <p className="mt-3 text-sm font-medium text-white/95">
            {place.distanceLabel
              ? `${place.distanceLabel} væk fra din nuværende placering`
              : 'Afstand beregnes når placering deles'}
          </p>
          <p className="mt-4 border-t border-white/25 pt-4 text-sm text-white/95">{place.productSummary}</p>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onSeeProducts?.(place)}
              className="flex w-full items-center justify-center gap-2 rounded-[5px] border border-white/40 bg-white/10 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
            >
              Se produkter
            </button>
            <button
              type="button"
              onClick={() => onDirections(place)}
              className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-white py-3 text-sm font-semibold shadow-sm active:scale-[0.99]"
              style={{ color: BLUE }}
            >
              <Navigation className="h-4 w-4" />
              Rute
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
