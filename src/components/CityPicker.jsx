// src/components/CityPicker.jsx
import React from "react";

/** Exported so App.jsx can import it without crashing */
export const CITY_COORDS = {
  ALL: { center: { lat: -28.7, lng: 24.7 }, zoom: 5 },
  JHB: { center: { lat: -26.2041, lng: 28.0473 }, zoom: 11 },
  PTA: { center: { lat: -25.7479, lng: 28.2293 }, zoom: 11 },
  CPT: { center: { lat: -33.9249, lng: 18.4241 }, zoom: 11 },
  DBN: { center: { lat: -29.8587, lng: 31.0218 }, zoom: 11 },
  PLZ: { center: { lat: -33.9608, lng: 25.6022 }, zoom: 11 },
  BLO: { center: { lat: -29.0852, lng: 26.1596 }, zoom: 12 },
  PLK: { center: { lat: -23.9045, lng: 29.4689 }, zoom: 12 },
};

const CITIES = [
  { key: "ALL", name: "All South Africa" },
  { key: "JHB", name: "Johannesburg" },
  { key: "PTA", name: "Pretoria" },
  { key: "CPT", name: "Cape Town" },
  { key: "DBN", name: "Durban" },
  { key: "PLZ", name: "Gqeberha / PE" },
  { key: "BLO", name: "Bloemfontein" },
  { key: "PLK", name: "Polokwane" },
];

export default function CityPicker({ value, onChange }) {
  return (
    <div className="absolute left-3 top-3 z-10">
      <button
        className="rounded-xl px-3 py-2 text-xs bg-black/50 text-white border border-white/20 backdrop-blur-md hover:bg-white/10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const menu = document.getElementById("gg-city-menu");
          if (menu) {
            menu.style.left = `${rect.left}px`;
            menu.style.top = `${rect.bottom + 6}px`;
            menu.classList.toggle("hidden");
          }
        }}
      >
        {CITIES.find((c) => c.key === value)?.name || "Choose city"}
      </button>

      <div
        id="gg-city-menu"
        className="hidden absolute bg-black/80 text-white border border-white/10 rounded-xl p-2 w-56 max-h-72 overflow-auto"
      >
        {CITIES.map((c) => (
          <button
            key={c.key}
            className={`w-full text-left text-xs px-2 py-1 rounded-lg hover:bg-white/10 ${
              value === c.key ? "bg-white/10" : ""
            }`}
            onClick={() => {
              onChange(c.key);
              document.getElementById("gg-city-menu")?.classList.add("hidden");
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
