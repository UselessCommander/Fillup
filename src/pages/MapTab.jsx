import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { usePlaces } from '../context/PlacesContext.jsx';
import MapScreen from '../components/MapScreen.jsx';
import PlaceBottomSheet from '../components/PlaceBottomSheet.jsx';

function openDirections(place) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
    '_blank',
    'noopener,noreferrer'
  );
}

export default function MapTab() {
  const navigate = useNavigate();
  const { places } = usePlaces();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selected, setSelected] = useState(null);

  return (
    <>
      <MapScreen
        places={places}
        selectedPlace={selected}
        onSelectPlace={setSelected}
        onClearSelection={() => setSelected(null)}
        onDirections={openDirections}
      />
      {selected && (
        <PlaceBottomSheet
          place={selected}
          onClose={() => setSelected(null)}
          onDirections={openDirections}
          onSeeProducts={(place) => {
            const id = place.id;
            setSelected(null);
            navigate(`/places/${id}`);
          }}
          favoriteActive={isFavorite(selected.id)}
          onToggleFavorite={() => toggleFavorite(selected.id)}
        />
      )}
    </>
  );
}
