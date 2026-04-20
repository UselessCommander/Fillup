import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { usePlaces } from '../context/PlacesContext.jsx';
import HomeScreen from '../components/HomeScreen.jsx';

export default function HomeTab() {
  const navigate = useNavigate();
  const { places, listLoading, listError } = usePlaces();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <HomeScreen
      places={places}
      loading={listLoading}
      error={listError}
      onSelectPlace={(p) => navigate(`/places/${p.id}`)}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
    />
  );
}
