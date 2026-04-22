import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchPlaces } from '../api.js';
import { useUserLocation } from './UserLocationContext.jsx';

const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const { effective } = useUserLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [categories, setCategories] = useState(['Alle', 'Shampoo', 'Vaskemiddel', 'Fødevarer']);
  const [filterOpen, setFilterOpen] = useState(false);

  const [mapSelectedPlace, setMapSelectedPlace] = useState(null);

  const [places, setPlaces] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const loadPlaces = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchPlaces({
        q: searchQuery,
        category: activeCategory,
        lat: effective.lat,
        lng: effective.lng,
      });
      setPlaces(data.places ?? []);
    } catch (e) {
      setListError(e.message ?? 'Fejl');
      setPlaces([]);
    } finally {
      setListLoading(false);
    }
  }, [searchQuery, activeCategory, effective.lat, effective.lng]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled && data.categories?.length) setCategories(data.categories);
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
      categories,
      places,
      listLoading,
      listError,
      filterOpen,
      setFilterOpen,
      mapSelectedPlace,
      setMapSelectedPlace,
      loadPlaces,
    }),
    [
      searchQuery,
      activeCategory,
      categories,
      places,
      listLoading,
      listError,
      filterOpen,
      mapSelectedPlace,
      loadPlaces,
    ]
  );

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error('usePlaces must be used within PlacesProvider');
  return ctx;
}
