import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

const DEFAULT_REVIEWS = [
  { name: "Lerato M.", city: "Johannesburg", text: "Found a lounge 5 min away + split the Uber. So easy." },
  { name: "Kagiso P.", city: "Cape Town", text: "Love the safety notes + map preview. Clean and quick." },
  { name: "Zanele K.", city: "Durban", text: "Tickets panel is clutch. Price matched on the night!" },
  { name: "Neo S.", city: "Pretoria", text: "Reminders saved me. No more 'where are you?' texts." },
];

export default function ReviewTicker({ reviews = DEFAULT_REVIEWS, interval = 3500 }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setIdx((i) => (i + 1) % reviews.length), interval);
    return () => clearInterval(timer.current);
  }, [reviews, interval]);

  return (
    // Raise z-index and keep pointer-events off so clicks pass through
    <div className="pointer-events-none relative z-10">
      {/* Floating top-right card — moved UP and a touch inward on larger screens */}
      <div className="absolute -top-12 sm:-top-16 md:-top-24 lg:-top-32 right-0 sm:right-2 md:right-6 w-[260px] sm:w-[280px]">
        <div className="rounded-2xl bg-white/8 backdrop-blur p-3 border border-white/10 shadow-xl animate-[float_8s_ease-in-out_infinite]">
          <div className="flex items-center gap-1 text-amber-300 text-xs">
            <Star className="h-3 w-3 fill-amber-300" />
            <Star className="h-3 w-3 fill-amber-300" />
            <Star className="h-3 w-3 fill-amber-300" />
            <Star className="h-3 w-3 fill-amber-300" />
            <Star className="h-3 w-3 fill-amber-300" />
          </div>
          <div className="mt-1 text-sm leading-snug text-slate-100">{reviews[idx].text}</div>
          <div className="mt-2 text-[11px] text-slate-300">— {reviews[idx].name} • {reviews[idx].city}</div>
        </div>
      </div>

      {/* Floating bottom-left teaser (unchanged, just a tiny lift) */}
      <div className="absolute bottom-8 left-0 w-[220px] hidden md:block">
        <div className="rounded-2xl bg-white/6 backdrop-blur p-3 border border-white/10 shadow-xl animate-[float_9s_ease-in-out_infinite]">
          <div className="text-[11px] text-slate-300 mb-1">Latest reviewer</div>
          <div className="text-sm text-slate-100">{reviews[(idx + 1) % reviews.length].text}</div>
        </div>
      </div>
    </div>
  );
}
