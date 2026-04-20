import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  } = usePlaces();

  const navTab = useMemo(() => {
    const p = location.pathname;
    if (p === '/map') return 'map';
    if (p.startsWith('/profile')) return 'profile';
    return 'home';
  }, [location.pathname]);

  const showMainHeader = location.pathname === '/' || location.pathname === '/map';

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-md flex-col bg-[#f4f6f8] shadow-xl">
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

      <div className="flex min-h-0 flex-1 flex-col">
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
