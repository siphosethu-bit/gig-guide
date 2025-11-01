import React, { useMemo } from "react";
import { Music, Martini, TentTree, Building2, Waves } from "lucide-react";

const PRESETS = [
  { key: "All",     label: "All", icon: Music },
  { key: "Club",    label: "Club", icon: Building2 },
  { key: "Lounge",  label: "Lounge", icon: Martini },
  { key: "Outdoor", label: "Outdoor", icon: TentTree },
  { key: "Beach",   label: "Beach", icon: Waves },
];

export default function CategoryChips({ events = [], value, onChange }) {
  const counts = useMemo(() => {
    const c = Object.create(null);
    for (const p of PRESETS) c[p.key] = 0;
    for (const e of events) {
      const keys = new Set();
      // naive tagging from existing fields
      if (e.category) keys.add(e.category);
      const bag = `${e.venue} ${(e.activities||[]).join(" ")}`.toLowerCase();
      if (/club|nightclub|konka|taboo|origin|tiger|zone 6/.test(bag)) keys.add("Club");
      if (/lounge|cocktail/.test(bag)) keys.add("Lounge");
      if (/outdoor|stage/.test(bag)) keys.add("Outdoor");
      if (/beach|grand beach|shimmy/.test(bag)) keys.add("Beach");
      if (!keys.size) keys.add("All");
      keys.add("All");
      for (const k of keys) c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [events]);

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map(({ key, label, icon:Icon }) => (
        <button
          key={key}
          onClick={() => onChange?.(key)}
          className={[
            "px-3 py-1.5 rounded-full border text-sm transition",
            value === key
              ? "bg-amber-400 text-black border-amber-400"
              : "border-white/15 text-slate-200 hover:bg-white/10"
          ].join(" ")}
        >
          <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
            <span className="text-xs opacity-70">({counts[key] || 0})</span>
          </span>
        </button>
      ))}
    </div>
  );
}
