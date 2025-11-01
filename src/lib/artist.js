// src/lib/artist.js
// Local MVP storage for artist-specific data

const key = (artistId, what) => `gg_${what}_${artistId}`;

export function saveGig(artistId, gig) {
  const all = loadGigs(artistId);
  const withId = { ...gig, id: gig.id || `gig_${Date.now()}` };
  const idx = all.findIndex(g => g.id === withId.id);
  if (idx >= 0) all[idx] = withId; else all.unshift(withId);
  localStorage.setItem(key(artistId, "artist_gigs"), JSON.stringify(all));
  return withId.id;
}

export function loadGigs(artistId) {
  try {
    return JSON.parse(localStorage.getItem(key(artistId, "artist_gigs"))) || [];
  } catch { return []; }
}

export function deleteGig(artistId, gigId) {
  const all = loadGigs(artistId).filter(g => g.id !== gigId);
  localStorage.setItem(key(artistId, "artist_gigs"), JSON.stringify(all));
}

export function loadFollowers(artistId) {
  try {
    return JSON.parse(localStorage.getItem(key(artistId, "followers"))) || [];
  } catch { return []; }
}
export function seedFollowers(artistId) {
  // one-time seed for demos
  const k = key(artistId, "followers");
  if (localStorage.getItem(k)) return;
  const demo = [
    { id: "u1", name: "Naledi", avatar: "https://i.pravatar.cc/64?img=1" },
    { id: "u2", name: "Thabo",  avatar: "https://i.pravatar.cc/64?img=15" },
    { id: "u3", name: "Kea",    avatar: "https://i.pravatar.cc/64?img=22" },
    { id: "u4", name: "Musa",   avatar: "https://i.pravatar.cc/64?img=36" },
  ];
  localStorage.setItem(k, JSON.stringify(demo));
}

export function loadViews(artistId) {
  try {
    return Number(localStorage.getItem(key(artistId, "profile_views"))) || 0;
  } catch { return 0; }
}
export function bumpViews(artistId, by=1) {
  const v = loadViews(artistId) + by;
  localStorage.setItem(key(artistId, "profile_views"), String(v));
  return v;
}

export function loadInbox(artistId) {
  try {
    return JSON.parse(localStorage.getItem(key(artistId, "artist_inbox"))) || [];
  } catch { return []; }
}
export function sendToArtist(artistId, msg) {
  const msgs = loadInbox(artistId);
  msgs.unshift({ id: `m_${Date.now()}`, ...msg, ts: new Date().toISOString(), read: false });
  localStorage.setItem(key(artistId, "artist_inbox"), JSON.stringify(msgs));
}
export function markRead(artistId, mid) {
  const msgs = loadInbox(artistId);
  msgs.forEach(m => { if (m.id === mid) m.read = true; });
  localStorage.setItem(key(artistId, "artist_inbox"), JSON.stringify(msgs));
}
