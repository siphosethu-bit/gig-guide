// src/lib/ratings.js
const KEY = "gg_event_ratings";
// shape: { [eventId]: { stars: 1-5, note?: string, ts: number } }

export function getRatings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setRating(eventId, stars, note = "") {
  const all = getRatings();
  all[eventId] = { stars, note, ts: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
  window.dispatchEvent(new CustomEvent("gg:ratings-changed"));
  return all[eventId];
}

export function removeRating(eventId) {
  const all = getRatings();
  delete all[eventId];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
  window.dispatchEvent(new CustomEvent("gg:ratings-changed"));
}

export function getRatedEventIds() {
  return Object.keys(getRatings());
}
