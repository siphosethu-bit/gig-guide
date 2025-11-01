// src/components/FavoriteButton.jsx
import React from "react";
import { Heart } from "lucide-react";
import { bumpPopularity } from "../lib/popularity";

export default function FavoriteButton({ isFaved, onToggle, event }) {
  function click(e) {
    e.stopPropagation?.();
    const wasFaved = !!isFaved;
    onToggle?.();
    // bump popularity locally when favourited; decrease a bit when unfavourited
    if (event?.id) {
      bumpPopularity(event.id, wasFaved ? -0.5 : +1);
    }
  }

  return (
    <button
      onClick={click}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm border ${
        isFaved ? "bg-pink-500 text-white border-pink-500" : "bg-white/5 text-slate-100 border-white/10"
      }`}
      title={isFaved ? "Saved" : "Save"}
      aria-pressed={isFaved ? "true" : "false"}
    >
      <Heart className={`h-4 w-4 ${isFaved ? "fill-current" : ""}`} />
      {isFaved ? "Saved" : "Save"}
    </button>
  );
}
