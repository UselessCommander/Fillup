import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext.jsx';
import BottomNav from '../components/BottomNav.jsx';
import FilterModal from '../components/FilterModal.jsx';
import SearchHeader from '../components/SearchHeader.jsx';

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    categories,
    filterOpen,
    setFilterOpen,
    mapSelectedPlace,
    setMapSelectedPlace,
  } = usePlaces();

  const navTab = useMemo(() => {
    const p = location.pathname;
    if (p === '/map') return 'map';
    if (p.startsWith('/profile')) return 'profile';
    return 'home';
  }, [location.pathname]);

  const showMainHeader = location.pathname === '/' || (location.pathname === '/map' && !mapSelectedPlace);
  const showMapDetailHeader = location.pathname === '/map' && !!mapSelectedPlace;

  return (
    <div className="relative mx-auto flex h-full min-h-0 max-w-md flex-col bg-[#f4f6f8] shadow-xl">
      {showMainHeader && (
        <SearchHeader
          variant={location.pathname === '/map' ? 'map' : 'home'}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={() => setFilterOpen(true)}
          navTab={navTab === 'profile' ? 'home' : navTab}
          onGoList={() => navigate('/')}
          onGoMap={() => navigate('/map')}
        />
      )}

      {showMapDetailHeader && (
        <div className="absolute top-0 left-0 right-0 z-[60] p-4 pt-6 pointer-events-none flex justify-start">
          <button
            onClick={() => setMapSelectedPlace(null)}
            className="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-md text-slate-800 pointer-events-auto active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col relative">
        <Outlet />
      </div>

      <BottomNav
        active={navTab}
        onChange={(id) => {
          if (id === 'home') navigate('/');
          else if (id === 'map') navigate('/map');
          else navigate('/profile');
        }}
      />

      <FilterModal
        open={filterOpen}
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
