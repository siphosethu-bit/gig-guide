import React, { useMemo } from "react";

function nextWeekendRange(now = new Date()) {
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const toFri = (5 - (day || 7) + 7) % 7; // days until Fri (5)
  const fri = new Date(now); fri.setHours(0,0,0,0); fri.setDate(fri.getDate()+toFri);
  const sun = new Date(fri); sun.setDate(sun.getDate()+2); sun.setHours(23,59,59,999);
  return [fri, sun];
}

export default function WeekendHighlights({ events = [], maxPrice = 200 }) {
  const [fri, sun] = useMemo(() => nextWeekendRange(new Date()), []);
  const picks = useMemo(() => {
    const list = events
      .filter(e => {
        const t = new Date(e.start);
        const price = typeof e.price === "number" ? e.price : Number.POSITIVE_INFINITY;
        return t >= fri && t <= sun && price <= maxPrice;
      })
      .sort((a,b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5);
    return list;
  }, [events, fri, sun, maxPrice]);

  if (!picks.length) return null;

  const blurb = `This weekend’s best under R${maxPrice}: ` +
    picks.map(e => e.name).join(", ") + ".";

  return (
    <div className="card-dark p-4 space-y-3">
      <div className="font-semibold">Weekend Highlights (≤ R{maxPrice})</div>
      <p className="text-sm text-slate-300">{blurb}</p>
      <ol className="list-decimal pl-5 text-sm">
        {picks.map(e => (
          <li key={e.id}>
            <span className="font-medium">{e.name}</span> — {e.venue} • {new Date(e.start).toLocaleString()}
          </li>
        ))}
      </ol>
    </div>
  );
}
