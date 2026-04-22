import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed, Layers, Box } from 'lucide-react';
import { useUserLocation } from '../context/UserLocationContext.jsx';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const PIN_COLORS = ['#139ED2', '#ef4444', '#f97316', '#a855f7'];

const MAP_STYLES = [
  { id: 'light', name: 'Lys (Premium)', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'streets', name: 'Klassiske Gader', style: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'dark', name: 'Mørk Tilstand', style: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'satellite', name: 'Satellit', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
];

function formatDuration(sec) {
  const m = Math.round(sec / 60);
  if (m >= 60) return `${Math.floor(m / 60)} t ${m % 60} min`;
  return `${m} min`;
}

function formatDistance(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export default function MapScreen({
  places,
  selectedPlace,
  onSelectPlace,
  onClearSelection,
  transportMode = 'driving',
  onRouteStatsChange,
  isLiveNavigating,
  onStopNavigation,
  routeStats,
}) {
  const mapRef = useRef(null);
  const { coords, compassHeading, refreshLocation } = useUserLocation();
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);

  const [activeStyle, setActiveStyle] = useState(MAP_STYLES[0]);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [is3D, setIs3D] = useState(false);

  // Auto-lokation ved sted-valg
  useEffect(() => {
    if (selectedPlace && !coords) {
      refreshLocation().catch(() => {});
    }
  }, [selectedPlace, coords, refreshLocation]);

  // Hent rute ("regnorm") + beregning af tid/afstand
  useEffect(() => {
    async function fetchRoute() {
      if (!selectedPlace || !coords) {
        setRouteGeoJSON(null);
        onRouteStatsChange?.(null);
        return;
      }
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${coords.lng},${coords.lat};${selectedPlace.lng},${selectedPlace.lat}?geometries=geojson&steps=true&language=da&access_token=${MAPBOX_TOKEN}`
        );
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setRouteGeoJSON({
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          });
          onRouteStatsChange?.({
            duration: formatDuration(route.duration),
            distance: formatDistance(route.distance),
            steps: route.legs?.[0]?.steps?.map(s => s.maneuver.instruction) || [],
          });

          if (mapRef.current && !isLiveNavigating) {
            const bounds = [
              [Math.min(coords.lng, selectedPlace.lng), Math.min(coords.lat, selectedPlace.lat)],
              [Math.max(coords.lng, selectedPlace.lng), Math.max(coords.lat, selectedPlace.lat)],
            ];
            mapRef.current.fitBounds(bounds, { padding: { top: 60, bottom: 350, left: 40, right: 40 }, duration: 800 });
          }
        } else {
          onRouteStatsChange?.({ duration: 'N/A', distance: 'N/A' });
          setRouteGeoJSON(null);
        }
      } catch (err) {
        console.error('Kunne ikke hente rute:', err);
      }
    }

    const timeoutId = setTimeout(fetchRoute, 200);
    return () => clearTimeout(timeoutId);
  }, [selectedPlace, coords, transportMode, onRouteStatsChange, isLiveNavigating]);

  // Centrer let ved start 
  useEffect(() => {
    if (!mapLoaded || !places?.length || selectedPlace || routeGeoJSON) return;
    try {
      if (places.length === 1 && mapRef.current) {
        mapRef.current.flyTo({ center: [places[0].lng, places[0].lat], zoom: 15, pitch: 0 });
        return;
      }
      let minLng = places[0].lng, maxLng = places[0].lng;
      let minLat = places[0].lat, maxLat = places[0].lat;
      places.forEach((p) => {
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
      });
      const bounds = [[minLng, minLat], [maxLng, maxLat]];
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: 40, duration: 0 });
      }
    } catch {
      /* ignorér */
    }
  }, [places, selectedPlace, routeGeoJSON, mapLoaded]);

  // Effekt der tilter kameraet til Live Navigation
  useEffect(() => {
    if (isLiveNavigating && coords && mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 17.5,
        pitch: 65,  // 3D Tilt!
        bearing: 0,
        duration: 1500
      });
    } else if (!isLiveNavigating && selectedPlace && coords && mapRef.current) {
      // Zoom tilbage til fugleperspektiv, når afbrudt
      const bounds = [
        [Math.min(coords.lng, selectedPlace.lng), Math.min(coords.lat, selectedPlace.lat)],
        [Math.max(coords.lng, selectedPlace.lng), Math.max(coords.lat, selectedPlace.lat)],
      ];
      mapRef.current.fitBounds(bounds, { padding: { top: 60, bottom: 350, left: 40, right: 40 }, duration: 800, pitch: 0 });
    }
  }, [isLiveNavigating, coords, selectedPlace]);

  return (
    <div className="relative min-h-0 flex-1 bg-slate-100">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 12.5683,
          latitude: 55.6761,
          zoom: 13,
        }}
        mapStyle={activeStyle.style}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setMapLoaded(true)}
        onMove={(evt) => setMapBearing(evt.viewState.bearing)}
        onClick={() => {
          if (isLiveNavigating) return; // Bloker afvælgning under navigation
          if (selectedPlace) onClearSelection();
          if (showStyleMenu) setShowStyleMenu(false);
        }}
      >
        {places?.map((p) => {
          const color = '#ef4444'; // Red
          const isSelected = selectedPlace?.id === p.id;
          return (
            <Marker
              key={p.id}
              longitude={p.lng}
              latitude={p.lat}
              anchor="bottom"
              onClick={(e) => {
                if (isLiveNavigating) return;
                e.originalEvent.stopPropagation();
                onSelectPlace(p);
              }}
              style={{ zIndex: isSelected ? 10 : 1 }}
            >
              <svg 
                width={isSelected ? 46 : 36} 
                height={isSelected ? 46 : 36} 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  cursor: 'pointer', 
                  filter: isSelected ? 'drop-shadow(0px 8px 12px rgba(0,0,0,0.4))' : 'drop-shadow(0px 3px 6px rgba(0,0,0,0.25))', 
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                }}
              >
                <path 
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                  fill={color} 
                  stroke="white" 
                  strokeWidth="1.5" 
                />
                <circle cx="12" cy="9" r="3" fill="white" />
              </svg>
            </Marker>
          );
        })}

        {/* Brugerens fysiske GPS position */}
        {coords && (
          <Marker longitude={coords.lng} latitude={coords.lat} style={{ zIndex: 100 }}>
            {isLiveNavigating ? (
              // Pilot-ikon under navigation
              <div 
                className="flex items-center justify-center rounded-full bg-white shadow-xl border-4 border-[#139ED2]" 
                style={{ width: '40px', height: '40px', transform: `rotate(${(compassHeading || 0) - mapBearing - 45}deg)` }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#139ED2" stroke="#139ED2" strokeWidth="2">
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
              </div>
            ) : (
              // Alm. pulserende blå prik med retnings-kegle
              <div className="relative flex items-center justify-center" style={{ width: '60px', height: '60px' }}>
                {/* Kegle / Kompas */}
                {compassHeading !== null && (
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `rotate(${compassHeading - mapBearing}deg)`,
                      transition: 'transform 0.2s ease-out',
                      pointerEvents: 'none',
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0',
                        height: '0',
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderBottom: '30px solid rgba(19, 158, 210, 0.3)',
                      }}
                    />
                  </div>
                )}
                {/* Selve prikken */}
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[#139ED2] shadow-md z-10"></span>
                </div>
              </div>
            )}
          </Marker>
        )}

        {/* Tegnet Rute */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line-outline"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': isLiveNavigating ? '#1a73e8' : '#006C9A', 'line-width': isLiveNavigating ? 14 : 7, 'line-opacity': isLiveNavigating ? 0.3 : 0.6 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': isLiveNavigating ? '#1a73e8' : '#139ED2', 'line-width': isLiveNavigating ? 8 : 4, 'line-opacity': 1 }}
            />
          </Source>
        )}

        {/* 3D Bygninger */}
        {is3D && (
          <Layer
            id="3d-buildings"
            source="composite"
            source-layer="building"
            filter={['==', 'extrude', 'true']}
            type="fill-extrusion"
            minzoom={15}
            paint={{
              'fill-extrusion-color': '#e2e8f0',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8
            }}
          />
        )}
      </Map>

      {/* Live Navigation - KÆMPE HUD I TOPPEN */}
      {isLiveNavigating && routeStats?.steps?.length > 0 && (
        <div className="absolute inset-x-0 top-0 z-[50] flex flex-col items-center pt-4 px-3 animate-in slide-in-from-top-6 duration-300">
          <div className="w-full max-w-sm overflow-hidden rounded-[16px] bg-[#1a73e8] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-extrabold leading-tight">{routeStats.steps[0]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Navigation - BUND MENU (Afslut) */}
      {isLiveNavigating && (
        <div className="absolute inset-x-0 bottom-0 z-[50] flex justify-between items-end p-5 bg-gradient-to-t from-black/60 to-transparent pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-8">
          <div className="flex flex-col rounded-[12px] bg-white px-5 py-3 shadow-xl">
            <span className="text-[#1a73e8] font-black text-2xl leading-none">{routeStats?.duration}</span>
            <span className="text-slate-500 font-bold text-[13px] mt-1">{routeStats?.distance}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onStopNavigation(); }}
            className="flex items-center justify-center rounded-[12px] bg-red-500 px-6 py-4 text-[16px] font-extrabold text-white shadow-xl active:scale-95 transition-transform"
          >
            Afslut Rute
          </button>
        </div>
      )}

      {/* Kort-tema Vælger - Skjules når man har valgt et sted for fokus */}
      {!selectedPlace && !isLiveNavigating && (
        <div className="absolute z-[10]" style={{ top: 12, right: 12 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStyleMenu(!showStyleMenu);
            }}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-black/5 bg-white text-slate-800 shadow-md transition hover:bg-slate-50"
            aria-label="Kort type"
          >
            <Layers className="h-5 w-5" />
          </button>
          
          {showStyleMenu && (
            <div className="absolute right-0 top-14 mt-1 w-44 overflow-hidden rounded-[10px] bg-white shadow-xl ring-1 ring-black/5 animate-in slide-in-from-top-1">
              {MAP_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStyle(s);
                    setShowStyleMenu(false);
                  }}
                  className={`block w-full px-4 py-3 text-left text-[14px] transition-colors ${
                    activeStyle.id === s.id
                      ? 'bg-[#139ED2]/10 font-bold text-[#139ED2]'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3D Toggle */}
      {!selectedPlace && !isLiveNavigating && (
        <div className="absolute z-[10]" style={{ top: 68, right: 12 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const new3D = !is3D;
              setIs3D(new3D);
              if (mapRef.current) {
                mapRef.current.flyTo({ pitch: new3D ? 60 : 0, duration: 1000 });
              }
            }}
            className={`flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-black/5 shadow-md transition ${
              is3D ? 'bg-[#139ED2] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
            aria-label="Toggle 3D"
          >
            <Box className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Min Lokation knap */}
      {!selectedPlace && !isLiveNavigating && (
        <div className="absolute z-[10]" style={{ bottom: 72, right: 12 }}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[10px] border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.1)] active:scale-95 transition-transform"
            onClick={async (e) => {
              e.stopPropagation();
              
              // Spørg om kompas-tilladelse på iOS 13+
              if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                try {
                  const perm = await window.DeviceOrientationEvent.requestPermission();
                  // Videresender uanset, da refreshLocation tager sig af lokation
                } catch (err) {
                  console.error('Kunne ikke spørge om kompas:', err);
                }
              }

              try {
                const c = await refreshLocation();
                mapRef.current?.flyTo({ center: [c.lng, c.lat], zoom: 15, duration: 1200 });
              } catch {
                window.alert('Tillad placering i browseren for at bruge Min position.');
              }
            }}
          >
            <LocateFixed className="h-5 w-5" style={{ color: '#139ED2' }} />
            Min position
          </button>
        </div>
      )}
    </div>
  );
}
