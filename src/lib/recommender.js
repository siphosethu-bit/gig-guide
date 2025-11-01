// src/lib/recommender.js
// Lightweight, client-side recommender that scores events using user signals
// (purchases + ratings) and metadata overlap (artists/tags/city).

import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { getRatings } from "./ratings"; // you already have this

// ---- Fetch purchases (adjust collection name/fields if needed) ----
export async function fetchUserPurchases() {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, async (u) => {
      stop && stop();
      if (!u) return resolve([]);
      try {
        // Example schema: orders/{doc} => { uid, eventId, createdAt }
        const q = query(collection(db, "orders"), where("uid", "==", u.uid));
        const snap = await getDocs(q);
        const ids = [];
        snap.forEach((d) => {
          const evId = d.data()?.eventId;
          if (evId != null) ids.push(String(evId));
        });
        resolve(ids);
      } catch {
        resolve([]);
      }
    });
  });
}

// ---- Build a user taste profile from purchases + ratings ----
export function buildUserSignals(allEvents, purchases, ratingsMap) {
  // Index for quick lookup
  const byId = new Map(allEvents.map((e) => [String(e.id), e]));
  const liked = new Map(); // artist -> weight
  const tagBag = new Map(); // tag -> weight
  const cities = new Map(); // city -> weight

  const bump = (map, key, w) => map.set(key, (map.get(key) || 0) + w);

  // Purchases = strong positive weight
  purchases.forEach((id) => {
    const e = byId.get(String(id));
    if (!e) return;
    (e.lineup || []).forEach((artist) => bump(liked, artist, 4.0));
    (e.tags || e.categories || []).forEach((t) => bump(tagBag, t, 3.0));
    if (e.city) bump(cities, e.city, 2.0);
  });

  // Ratings = weight proportional to stars
  Object.entries(ratingsMap || {}).forEach(([id, r]) => {
    const e = byId.get(String(id));
    if (!e) return;
    const w = (r?.stars || 0) / 5; // 0..1
    if (!w) return;
    (e.lineup || []).forEach((artist) => bump(liked, artist, 2.5 * w));
    (e.tags || e.categories || []).forEach((t) => bump(tagBag, t, 2.0 * w));
    if (e.city) bump(cities, e.city, 1.0 * w);
  });

  return { liked, tagBag, cities };
}

// ---- Score a single event against the profile ----
export function scoreEvent(e, profile) {
  if (!profile) return 0;
  const { liked, tagBag, cities } = profile;

  let s = 0;

  // artist overlap
  (e.lineup || []).forEach((a) => (s += (liked.get(a) || 0) * 1.0));

  // tag overlap (Dance, Hip-Hop, Outdoor, VIP, etc.)
  const tags = e.tags || e.categories || [];
  tags.forEach((t) => (s += (tagBag.get(t) || 0) * 0.8));

  // city bonus
  if (e.city) s += (cities.get(e.city) || 0) * 0.6;

  // a tiny popularity nudge if you carry it
  if (typeof e.popularity === "number") s += 0.15 * e.popularity;

  // slight boost if price range fits typical past choices – optional hook
  // if (e.price && e.price < 300) s += 0.2;

  // penalize past purchases (we've already attended)
  // (caller will typically filter these out, but guard here)
  return s;
}

// ---- Rank future events ----
export function rankRecommendations(allEvents, profile, excludeIds = []) {
  const exclude = new Set(excludeIds.map(String));
  const scored = allEvents
    .filter((e) => !exclude.has(String(e.id)))
    .map((e) => ({ e, s: scoreEvent(e, profile) }));
  scored.sort((a, b) => b.s - a.s);
  return scored;
}
