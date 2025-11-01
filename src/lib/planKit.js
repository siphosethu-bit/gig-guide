// src/lib/planKit.js
export function buildPlanPayload({ eventId, eventName, start, leaveAt, pickupAt, riders = 2, uberTotal = 0 }) {
  return {
    v: 1,
    eventId,
    eventName,
    start,
    leaveAt,  // when you all leave for the event
    pickupAt, // when you want to be fetched back
    riders,
    uberTotal, // expected round-trip Uber amount
    perPerson: riders ? Math.round(Number(uberTotal || 0) / Number(riders)) : 0,
    createdAt: new Date().toISOString(),
  };
}

export function encodePlan(payload) {
  const s = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(s)));
}

export function decodePlan(encoded) {
  try {
    const s = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(s);
  } catch {
    return null;
  }
}
