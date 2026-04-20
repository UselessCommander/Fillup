import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { UserLocationProvider } from './context/UserLocationContext.jsx';
import { PlacesProvider } from './context/PlacesContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { UserPrefsProvider } from './context/UserPrefsContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserLocationProvider>
          <PlacesProvider>
            <FavoritesProvider>
              <UserPrefsProvider>
                <App />
              </UserPrefsProvider>
            </FavoritesProvider>
          </PlacesProvider>
        </UserLocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
