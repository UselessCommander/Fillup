import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { fetchPlaces } from '../api.js';
import { useUserLocation } from '../context/UserLocationContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import FavoriteHeart from '../components/FavoriteHeart.jsx';

const BLUE = '#139ED2';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { effective } = useUserLocation();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPlaces({
          q: '',
          category: 'Alle',
          lat: effective.lat,
          lng: effective.lng,
        });
        if (!cancelled) setPlaces(data.places ?? []);
      } catch {
        if (!cancelled) setPlaces([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effective.lat, effective.lng]);

  const favPlaces = places.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <PageHeader title="Gemte steder" onBack={() => navigate('/profile')} />
      <div className="space-y-3 p-4 pb-28">
        {loading && <p className="text-sm text-slate-600">Henter…</p>}
        {!loading && favPlaces.length === 0 && (
          <div className="rounded-[5px] border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            Du har ingen gemte steder endnu. Tryk på hjertet på et sted for at gemme det.
            <Link to="/" className="mt-3 block font-semibold" style={{ color: BLUE }}>
              Gå til forsiden
            </Link>
          </div>
        )}
        {favPlaces.map((p) => (
          <div
            key={p.id}
            className="flex items-stretch gap-3 rounded-[5px] border border-slate-100 bg-white p-3 shadow-sm"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-3 text-left"
              onClick={() => navigate(`/places/${p.id}`)}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[5px] text-white"
                style={{ backgroundColor: BLUE }}
              >
                <MapPin className="h-6 w-6 opacity-90" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="truncate text-sm text-slate-600">{p.address}</p>
                {p.distanceLabel && (
                  <span
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: BLUE, padding: '2px 8px', borderRadius: 5 }}
                  >
                    <Navigation className="h-3 w-3" />
                    {p.distanceLabel}
                  </span>
                )}
              </div>
            </button>
            <FavoriteHeart active={isFavorite(p.id)} onToggle={() => toggleFavorite(p.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
