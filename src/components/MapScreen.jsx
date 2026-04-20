import { useEffect, useMemo } from 'react';
import { ArrowLeft, LocateFixed, Navigation } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserLocation } from '../context/UserLocationContext.jsx';

const PIN_COLORS = ['#139ED2', '#ef4444', '#f97316', '#a855f7'];

function iconForPlace(id) {
  const color = PIN_COLORS[(id - 1) % PIN_COLORS.length];
  return L.divIcon({
    className: 'fillup-pin',
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.28)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({ places }) {
  const map = useMap();
  useEffect(() => {
    if (!places?.length) return;
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 15);
      return;
    }
    const b = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(b.pad(0.15));
  }, [map, places]);
  return null;
}

function LocateControl({ disabled }) {
  const map = useMap();
  const { refreshLocation } = useUserLocation();
  if (disabled) return null;
  return (
    <div className="leaflet-bottom leaflet-right" style={{ bottom: 72, right: 12, margin: 0, zIndex: 1000 }}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-[5px] border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-md"
        onClick={async () => {
          try {
            const c = await refreshLocation();
            map.flyTo([c.lat, c.lng], 15);
          } catch {
            window.alert('Tillad placering i browseren for at bruge Min position.');
          }
        }}
      >
        <LocateFixed className="h-4 w-4" style={{ color: '#139ED2' }} />
        Min position
      </button>
    </div>
  );
}

export default function MapScreen({
  places,
  selectedPlace,
  onSelectPlace,
  onClearSelection,
  onDirections,
}) {
  const center = useMemo(() => {
    if (places?.length) {
      const lat = places.reduce((s, p) => s + p.lat, 0) / places.length;
      const lng = places.reduce((s, p) => s + p.lng, 0) / places.length;
      return [lat, lng];
    }
    return [55.6761, 12.5683];
  }, [places]);

  return (
    <div className="relative min-h-0 flex-1">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full min-h-[420px] w-full rounded-none"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places?.length > 0 && <FitBounds places={places} />}
        {places?.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={iconForPlace(p.id)}
            eventHandlers={{
              click: () => onSelectPlace(p),
            }}
          />
        ))}
        <LocateControl disabled={!!selectedPlace} />
      </MapContainer>

      {selectedPlace && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex justify-between px-3 pt-3">
            <button
              type="button"
              onClick={onClearSelection}
              className="pointer-events-auto rounded-[5px] bg-white p-3 text-slate-800 shadow-lg ring-1 ring-black/5"
              aria-label="Tilbage"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onDirections(selectedPlace)}
              className="pointer-events-auto rounded-[5px] bg-white p-3 text-slate-800 shadow-lg ring-1 ring-black/5"
              aria-label="Navigation"
            >
              <Navigation className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
