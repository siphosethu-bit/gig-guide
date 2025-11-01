// src/lib/analytics.js
const KEY = "gg_analytics_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch { return {}; }
}
function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
}

export function trackImpression(eventId) {
  const db = load();
  db[eventId] = db[eventId] || { views: 0, map: 0, ticket: 0, uber: 0, share: 0, favorite: 0 };
  db[eventId].views += 1;
  save(db);
}

export function trackAction(eventId, kind) {
  const db = load();
  db[eventId] = db[eventId] || { views: 0, map: 0, ticket: 0, uber: 0, share: 0, favorite: 0 };
  if (db[eventId][kind] == null) db[eventId][kind] = 0;
  db[eventId][kind] += 1;
  save(db);
}

export function getMetrics(eventId) {
  const db = load();
  return db[eventId] || { views: 0, map: 0, ticket: 0, uber: 0, share: 0, favorite: 0 };
}

export function getAllMetrics() {
  return load();
}

export function resetAnalytics() {
  try { localStorage.removeItem(KEY); } catch {}
}
