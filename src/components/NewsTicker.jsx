// src/components/NewsTicker.jsx
import React from "react";
import { Megaphone } from "lucide-react";

/**
 * A seamless scrolling news ticker.
 * Props:
 *  - items: string[] (e.g., "Kanye West — Rocking the Daisies")
 *  - speed: seconds for a full loop (default 28)
 *  - label: small left label (default "International acts in SA")
 */
export default function NewsTicker({
  items = [],
  speed = 28,
  label = "International acts in SA",
}) {
  // Build the single line of text with separators
  const line =
    items.length > 0
      ? items.join("  •  ")
      : "Loading…  •  Loading…  •  Loading…";

  // Clamp speed 10s – 60s for sanity
  const dur = `${Math.max(10, Math.min(60, speed))}s`;

  return (
    <div className="news-ticker relative overflow-hidden border-t border-white/10 bg-black/30">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#0b0b12] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#0b0b12] to-transparent z-10" />

      {/* header row */}
      <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-300">
        <Megaphone className="h-3.5 w-3.5 text-amber-300" />
        {label}
      </div>

      {/* scrolling track */}
      <div className="relative px-3 pb-2">
        <div className="whitespace-nowrap">
          <div className="ticker-track inline-flex" style={{ ["--dur"]: dur }}>
            <span className="px-2 text-sm text-slate-100">{line}</span>
            {/* duplicate for seamless loop */}
            <span
              className="px-2 text-sm text-slate-100"
              aria-hidden="true"
            >
              {line}
            </span>
          </div>
        </div>
      </div>

      {/* scoped styles so you don't need to touch index.css */}
      <style>{`
        .news-ticker .ticker-track {
          animation: gg_ticker var(--dur) linear infinite;
          will-change: transform;
        }
        .news-ticker:hover .ticker-track { animation-play-state: paused; }
        @keyframes gg_ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* half, because content duplicated */
        }
      `}</style>
    </div>
  );
}
