// src/lib/popularity.js
const KEY = "gg_popularity_v1"; // { [eventId]: number }

export function getPopularityMap() {
  try {
    const raw = localStorage.getItem(KEY);
    const m = raw ? JSON.parse(raw) : {};
    return typeof m === "object" && m ? m : {};
  } catch {
    return {};
  }
}

export function bumpPopularity(eventId, delta = 1) {
  const map = getPopularityMap();
  const next = Math.max(0, (map[eventId] || 0) + delta);
  map[eventId] = next;
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
  return next;
}

export function topNByPopularity(events, n = 5) {
  const map = getPopularityMap();
  return [...events]
    .sort((a, b) => (map[b.id] || 0) - (map[a.id] || 0))
    .slice(0, n)
    .map((e) => e.id);
}
