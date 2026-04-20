import { Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import HomeTab from './pages/HomeTab.jsx';
import MapTab from './pages/MapTab.jsx';
import ProfileHomePage from './pages/ProfileHomePage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import AuthLoginPage from './pages/AuthLoginPage.jsx';
import AuthRegisterPage from './pages/AuthRegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PlaceDetailPage from './pages/PlaceDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthLoginPage />} />
      <Route path="/opret" element={<AuthRegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomeTab />} />
          <Route path="map" element={<MapTab />} />
          <Route path="profile" element={<ProfileHomePage />} />
          <Route path="profile/favorites" element={<FavoritesPage />} />
          <Route path="profile/settings" element={<SettingsPage />} />
          <Route path="profile/about" element={<AboutPage />} />
          <Route path="profile/help" element={<HelpPage />} />
          <Route path="profile/privacy" element={<PrivacyPage />} />
          <Route path="profile/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/places/:id" element={<PlaceDetailPage />} />
      </Route>
    </Routes>
  );
}
