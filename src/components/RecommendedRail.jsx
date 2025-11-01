// src/components/RecommendedRail.jsx
import React from "react";
import { motion } from "framer-motion";
import { Wand2, Sparkles } from "lucide-react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getRatings } from "../lib/ratings";
import {
  fetchUserPurchases,
  buildUserSignals,
  rankRecommendations,
} from "../lib/recommender";
import EventCard from "./EventCard";

const glass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl";

export default function RecommendedRail({ events, className = "" }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    const stop = onAuthStateChanged(auth, async (u) => {
      setSignedIn(!!u);
      if (!u) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const purchases = await fetchUserPurchases(); // []
      const ratings = getRatings(); // your local map {eventId: {stars, note, ts}}
      const profile = buildUserSignals(events, purchases, ratings);

      // Exclude events you already bought or explicitly rated low
      const exclude = [
        ...purchases,
        ...Object.entries(ratings)
          .filter(([, r]) => (r?.stars || 0) >= 4) // we'll still recommend similar; not excluding
          .map(([id]) => id),
      ];

      const ranked = rankRecommendations(events, profile, exclude)
        .filter((x) => x.s > 0.1) // threshold: tweak
        .slice(0, 12) // take top N
        .map((x) => x.e);

      setItems(ranked);
      setLoading(false);
    });
    return stop;
  }, [events]);

  if (!signedIn) return null; // only for signed-in users
  if (loading) {
    return (
      <div className={`${glass} p-5 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <div className="font-semibold">Recommended for you</div>
        </div>
        <div className="text-sm text-slate-300">Learning your vibe…</div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className={`${glass} p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-amber-300" />
          <div className="font-semibold">Recommended for you</div>
        </div>
        <div className="text-[11px] text-slate-300">
          Based on your tickets & ratings
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1">
          {items.map((e, idx) => (
            <motion.div
              key={e.id ?? idx}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              className="min-w-[280px] max-w-[280px] snap-start"
            >
              <EventCard event={e} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
