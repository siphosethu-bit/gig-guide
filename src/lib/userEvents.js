// src/lib/userEvents.js
const KEY = "gg_user_events_v1";

export function getUserEvents() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addUserEvent(evt) {
  const list = getUserEvents();
  list.push(evt);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearUserEvents() {
  localStorage.removeItem(KEY);
}
