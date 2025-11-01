// src/components/BigMap.jsx
import React, { useMemo, useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import CityPicker, { CITY_COORDS } from "./CityPicker";

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b0b0b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#f1f1f1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0b" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", stylers: [{ color: "#1a1a1a" }] },
];

const containerStyle = { width: "100%", height: "56vh", borderRadius: "1.5rem" };

function statusOfEvent(e) {
  const now = Date.now();
  const start = new Date(e.start || e.dateStart || Date.now()).getTime();
  const end = new Date(e.end || e.dateEnd || e.start || Date.now()).getTime();
  if (end < now) return "closed";
  if (start - now <= 1000 * 60 * 60 * 24 * 3) return "soon";
  return "upcoming";
}

export default function BigMap({ cityKey, onCityChange, events = [], onPick }) {
   const { isLoaded, loadError } = useJsApiLoader({
     id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState(null);
  const centerAndZoom = CITY_COORDS[cityKey] || CITY_COORDS.ALL;

  const markers = useMemo(() => {
    return events
      .map((e) => {
        const pos = e.coords || e.position; // support both shapes
        if (!pos?.lat || !pos?.lng) return null;
        return { id: e.id, name: e.name, pos, status: statusOfEvent(e), raw: e };
      })
      .filter(Boolean);
  }, [events]);

  const onLoad = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
        Failed to load Google Maps. Check your API key & referrer restrictions.
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative">
      <CityPicker value={cityKey} onChange={onCityChange} />

      <GoogleMap
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapContainerStyle={containerStyle}
        center={centerAndZoom.center}
        zoom={centerAndZoom.zoom}
        options={{ disableDefaultUI: true, zoomControl: true, styles: MAP_STYLE }}
      >
        {markers.map((m) => {
          const color =
            m.status === "closed" ? "#9a9a9a" : m.status === "soon" ? "#ffd000" : "#34d399";
          return (
            <Marker
              key={m.id}
              position={m.pos}
              title={m.name}
              onClick={() => onPick?.(m.raw)}
              icon={{
                path: "M16 0C9 0 3.5 5.5 3.5 12.3c0 8.1 11 19.4 11.4 19.8a1 1 0 0 0 1.4 0c.4-.4 11.2-11.7 11.2-19.8C27.5 5.5 22 0 16 0z",
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#111",
                strokeWeight: 1,
                scale: 0.7,
                anchor: { x: 16, y: 32 },
              }}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}
