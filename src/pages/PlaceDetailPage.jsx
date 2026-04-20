import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPlace } from '../api.js';
import { useUserLocation } from '../context/UserLocationContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import PlaceDetailScreen from '../components/PlaceDetailScreen.jsx';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { effective } = useUserLocation();
  const pid = Number.parseInt(id ?? '', 10);
  const { isFavorite, toggleFavorite, addRecent } = useFavorites();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(pid)) {
      setPlace(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPlace(pid, { lat: effective.lat, lng: effective.lng });
        if (!cancelled && data.place) {
          setPlace(data.place);
          addRecent(data.place);
        } else if (!cancelled) setPlace(null);
      } catch {
        if (!cancelled) setPlace(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pid, addRecent, effective.lat, effective.lng]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  if (loading) {
    return (
      <div className="mx-auto flex h-full min-h-0 max-w-md flex-col items-center justify-center bg-white px-6 text-sm text-slate-600 shadow-xl">
        Henter sted…
      </div>
    );
  }

  if (!place) {
    return (
      <div className="mx-auto flex h-full min-h-0 max-w-md flex-col items-center justify-center gap-4 bg-white px-6 text-center shadow-xl">
        <p className="text-sm text-slate-700">Stedet findes ikke eller kunne ikke hentes.</p>
        <button
          type="button"
          className="rounded-[5px] px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: '#139ED2' }}
          onClick={() => navigate('/')}
        >
          Til forsiden
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-md flex-col bg-white shadow-xl">
      <PlaceDetailScreen
        place={place}
        onBack={goBack}
        favoriteActive={isFavorite(place.id)}
        onToggleFavorite={() => toggleFavorite(place.id)}
      />
    </div>
  );
}
