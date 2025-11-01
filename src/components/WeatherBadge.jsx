import React, { useEffect, useState } from "react";

// Uses Open-Meteo (no key). Show simple badge for event's datetime.
export default function WeatherBadge({ lat, lon, when }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!lat || !lon || !when) return;
    const date = new Date(when);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth()+1).padStart(2,"0");
    const dd = String(date.getDate()).padStart(2,"0");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability&start_date=${yyyy}-${mm}-${dd}&end_date=${yyyy}-${mm}-${dd}&timezone=Africa%2FJohannesburg`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const idx = d?.hourly?.time?.findIndex(t => t.includes(`${yyyy}-${mm}-${dd}T${String(date.getHours()).padStart(2,"0")}:`));
        if (idx >= 0) {
          setInfo({
            temp: Math.round(d.hourly.temperature_2m[idx]),
            rain: d.hourly.precipitation_probability[idx]
          });
        }
      })
      .catch(()=>{});
  }, [lat, lon, when]);

  if (!info) return null;

  return (
    <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg border border-white/15 bg-white/5">
      <span>Forecast:</span>
      <span className="font-semibold">{info.temp}°C</span>
      <span className="text-sky-300">{info.rain}% rain</span>
    </div>
  );
}
