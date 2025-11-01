// src/lib/reminders.js
const KEY = "gg_reminders_v1";

/** shape: { id, eventId, title, whenISO, fired:boolean } */

export function getReminders() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getRemindersForEvent(eventId) {
  return getReminders().filter(r => r.eventId === eventId);
}

export function addReminder({ eventId, title, whenISO }) {
  const id = `${eventId}-${Date.now()}`;
  const r = { id, eventId, title, whenISO, fired: false };
  const list = getReminders();
  list.push(r);
  localStorage.setItem(KEY, JSON.stringify(list));
  return r;
}

export function cancelReminder(id) {
  const list = getReminders().filter(r => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function cancelRemindersForEvent(eventId) {
  const list = getReminders().filter(r => r.eventId !== eventId);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function markFired(id) {
  const list = getReminders().map(r => (r.id === id ? { ...r, fired: true } : r));
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function findDue(now = new Date()) {
  const t = now.getTime();
  return getReminders().filter(r => !r.fired && Date.parse(r.whenISO) <= t);
}

// Helpers
export function toISOFromLocalDatetime(localStr) {
  // localStr like "2025-09-20T18:00"
  return new Date(localStr).toISOString();
}
