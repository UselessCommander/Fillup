import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { usePlaces } from '../context/PlacesContext.jsx';
import MapScreen from '../components/MapScreen.jsx';
import PlaceBottomSheet from '../components/PlaceBottomSheet.jsx';

function openGoogleMaps(place) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
    '_blank',
    'noopener,noreferrer'
  );
}

export default function MapTab() {
  const navigate = useNavigate();
  const { places, mapSelectedPlace: selected, setMapSelectedPlace: setSelected } = usePlaces();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [transportMode, setTransportMode] = useState('driving');
  const [routeStats, setRouteStats] = useState(null);
  const [isLiveNavigating, setIsLiveNavigating] = useState(false);

  const handleClearSelection = () => {
    setSelected(null);
    setRouteStats(null);
    setIsLiveNavigating(false);
  };

  // Nulstil valg når vi forlader kortet
  useEffect(() => {
    return () => {
      setSelected(null);
    };
  }, [setSelected]);

  return (
    <>
      <MapScreen
        places={places}
        selectedPlace={selected}
        onSelectPlace={(p) => {
          setSelected(p);
          setIsLiveNavigating(false);
        }}
        onClearSelection={handleClearSelection}
        transportMode={transportMode}
        onRouteStatsChange={setRouteStats}
        
        isLiveNavigating={isLiveNavigating}
        onStopNavigation={() => setIsLiveNavigating(false)}
        routeStats={routeStats}
      />
      
      {selected && !isLiveNavigating && (
        <PlaceBottomSheet
          place={selected}
          onClose={handleClearSelection}
          onDirections={openGoogleMaps}
          onStartLiveNavigation={() => setIsLiveNavigating(true)}
          onSeeProducts={(place) => {
            const id = place.id;
            handleClearSelection();
            navigate(`/places/${id}`);
          }}
          favoriteActive={isFavorite(selected.id)}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          
          transportMode={transportMode}
          onTransportModeChange={setTransportMode}
          routeStats={routeStats}
        />
      )}
    </>
  );
}
