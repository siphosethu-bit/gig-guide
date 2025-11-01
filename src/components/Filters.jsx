// src/components/Filters.jsx
import React from "react";
import FilterPill from "./FilterPill";

function collectCategories(events) {
  const set = new Set();
  events.forEach((e) => {
    if (e.category) set.add(e.category);
    (e.activities || []).forEach((a) => {
      if (/beach|outdoor/i.test(a)) set.add("Outdoor");
    });
    if (/beach|grand beach|shimmy/i.test(`${e.venue} ${e.city}`)) set.add("Beach");
    if (/lounge|cocktail/i.test(`${e.venue}`)) set.add("Lounge");
    if (/club|nightclub|konka|taboo|origin|tiger|zone 6/i.test(`${e.venue}`)) set.add("Club");
  });
  return ["All", ...[...set]];
}

export default function Filters({ events, active, onChange, showFaves, onToggleFaves }) {
  const cats = collectCategories(events);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cats.map((c) => (
        <FilterPill
          key={c}
          label={c}
          pressed={active === c}
          onClick={() => onChange(c)}
        />
      ))}
      <FilterPill
        label="⭐ Favourites"
        pressed={!!showFaves}
        onClick={onToggleFaves}
      />
    </div>
  );
}
