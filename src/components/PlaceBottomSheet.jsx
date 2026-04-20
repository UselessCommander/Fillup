import { useState } from 'react';
import { Navigation, Car, Bike, Footprints, ListOrdered } from 'lucide-react';
import FavoriteHeart from './FavoriteHeart.jsx';

const BLUE = '#139ED2';

export default function PlaceBottomSheet({
  place,
  onClose,
  onDirections,
  onStartLiveNavigation,
  onSeeProducts,
  favoriteActive,
  onToggleFavorite,
  transportMode,
  onTransportModeChange,
  routeStats,
}) {
  const [showSteps, setShowSteps] = useState(false);

  if (!place) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/5"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md animate-in slide-in-from-bottom duration-200">
        <div
          className="flex flex-col rounded-t-[28px] text-white shadow-[0_-8px_40px_rgba(0,0,0,0.22)]"
          style={{ backgroundColor: BLUE, paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          {/* Træk-håndtag */}
          <div className="mx-auto mt-4 mb-2 h-1 w-12 rounded-full bg-white/35" />

          <div className="px-5 pt-2 pb-4">
            {/* Rute Stats & Transport Valg */}
            <div className="flex w-full items-center justify-between gap-1 overflow-hidden rounded-[10px] bg-white/10 p-1 mb-4 shadow-inner">
              {[
                { id: 'driving', icon: Car, label: 'Bil' },
                { id: 'cycling', icon: Bike, label: 'Cykel' },
                { id: 'walking', icon: Footprints, label: 'Gå' },
              ].map((m) => {
                const Icon = m.icon;
                const isActive = transportMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onTransportModeChange?.(m.id);
                      if (showSteps) setShowSteps(false); // Lukker steps ved skift
                    }}
                    className={`flex flex-1 flex-col items-center justify-center rounded-[8px] py-1.5 transition-colors ${
                      isActive ? 'bg-white text-[#139ED2] shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={m.label}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  </button>
                );
              })}
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <h2 className="text-[22px] font-bold leading-tight tracking-tight">{place.name}</h2>
                <p className="mt-1 text-[14px] text-white/80">{place.address}</p>
                
                {routeStats ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[18px] font-extrabold text-[#94CF53]">
                      {routeStats.duration}
                    </span>
                    <span className="text-white/60">•</span>
                    <span className="text-[14px] font-medium text-white/90">
                      {routeStats.distance} væk
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-medium text-white/70">
                    Beregner rute... (Lokation påkrævet)
                  </p>
                )}
              </div>
              
              {onToggleFavorite && (
                <FavoriteHeart
                  active={favoriteActive}
                  onToggle={onToggleFavorite}
                  variant="onDark"
                  className="shrink-0 bg-white/15 hover:bg-white/25 mt-1"
                  label="Gem sted"
                />
              )}
            </div>
          </div>

          <div className="px-5 pt-4 border-t border-white/20">
            {!showSteps && (
              <p className="text-[13px] text-white/80 leading-relaxed mb-4">
                 {place.description || place.productSummary}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {/* Start Rute In-App */}
              <button
                type="button"
                onClick={() => onStartLiveNavigation()}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] py-4 text-[16px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#139ED2' }} // Blå for at vise det er in-house web app nav
              >
                <Navigation className="h-5 w-5" fill="currentColor" />
                Start In-App Navigation
              </button>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => onDirections(place)}
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-white/20 py-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-white/30 active:scale-[0.98]"
                >
                  Brug Google Maps
                </button>
                <button
                  type="button"
                  onClick={() => onSeeProducts?.(place)}
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-white/30 bg-white/10 py-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-white/20 active:scale-[0.98]"
                >
                  Butikkens udvalg
                </button>
              </div>
            </div>

            {/* De konkrete steps, rulles ud hvis 'showSteps' er sat */}
            {showSteps && routeStats?.steps && (
              <div className="mt-4 flex flex-col max-h-[30vh] overflow-y-auto px-1 py-1 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                <h3 className="text-sm font-bold text-white/90 mb-3 ml-1 uppercase tracking-wider">
                  Trin for trin rutevejledning
                </h3>
                <div className="flex flex-col relative before:absolute before:left-[11px] before:top-4 before:bottom-6 before:w-[2px] before:bg-white/20">
                  {routeStats.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative pb-4">
                      {/* Cirkel på den hvide tidslinje-streg */}
                      <div className="relative z-10 flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-[#139ED2] border border-white/40 text-[11px] font-bold text-white shadow-sm">
                        {idx + 1}
                      </div>
                      <p className="text-[14px] text-white/95 pt-0.5 leading-snug">
                        {step}
                      </p>
                    </div>
                  ))}
                  {/* Destination prik i bunden */}
                  <div className="flex gap-4 items-center relative">
                      <div className="relative z-10 flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-[#94CF53] border-2 border-white/90 shadow-sm">
                        <Navigation className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-[15px] font-bold text-[#94CF53]">
                        Du er ankommet!
                      </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
