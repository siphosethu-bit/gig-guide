// src/components/SharePlan.jsx
import React, { useMemo, useState } from "react";
import { Users, Share2, Clock, Car } from "lucide-react";
import { buildPlanPayload, encodePlan } from "../lib/planKit";

export default function SharePlan({ event, onShared }) {
  const [riders, setRiders] = useState(3);
  const [uber, setUber] = useState(150); // round trip
  const [leaveAt, setLeaveAt] = useState(() => toLocalDT(event?.start));
  const [pickupAt, setPickupAt] = useState(() => toLocalDT(event?.end));

  const perPerson = useMemo(() => {
    const val = Number(uber || 0) / Number(riders || 1);
    return isFinite(val) ? Math.round(val) : 0;
  }, [uber, riders]);

  function share() {
    const payload = buildPlanPayload({
      eventId: event.id,
      eventName: event.name,
      start: event.start,
      leaveAt,
      pickupAt,
      riders: Number(riders || 1),
      uberTotal: Number(uber || 0),
    });
    const code = encodePlan(payload);
    const url = `${location.origin}${location.pathname}?plan=${code}`;

    // Try native share, fall back to clipboard
    if (navigator.share) {
      navigator
        .share({
          title: `Plan: ${event.name}`,
          text: `Ride split ~R${payload.perPerson}/person. Join my plan 👉`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      onShared?.(url);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-glow">
      <div className="flex items-center gap-2 font-semibold text-slate-100 mb-3">
        <Users className="h-5 w-5" /> Group planning
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs text-slate-300">
          Leave at
          <input
            type="datetime-local"
            value={leaveAt}
            onChange={(e) => setLeaveAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="text-xs text-slate-300">
          Pickup at
          <input
            type="datetime-local"
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="text-xs text-slate-300">
          Riders
          <input
            type="number"
            min="1"
            value={riders}
            onChange={(e) => setRiders(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="text-xs text-slate-300 sm:col-span-2">
          Uber round trip (R)
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2">
            <Car className="h-4 w-4 text-slate-300" />
            <input
              type="number"
              min="0"
              value={uber}
              onChange={(e) => setUber(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </label>

        <div className="text-xs text-slate-300 grid content-center">
          <div>
            Split: <b className="text-amber-300">R{perPerson}</b> / person
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={share}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-black px-3 py-2 text-sm font-semibold hover:scale-[1.02] transition glow-button btn-bounce"
        >
          <Share2 className="h-4 w-4" /> Share plan
        </button>
        <div className="text-xs text-slate-400 self-center flex items-center gap-1">
          <Clock className="h-4 w-4" /> We’ll include times + ride split
        </div>
      </div>
    </div>
  );
}

function toLocalDT(iso) {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}
