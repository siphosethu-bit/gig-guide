// src/components/SafetyPanel.jsx
import React from "react";
import { ShieldAlert, Info } from "lucide-react";

function assessRisk(city, venue) {
  const s = `${venue} ${city}`.toLowerCase();
  if (/soweto|umlazi|florida road/i.test(s))
    return { level: "Medium", color: "amber", note: "Stay with your group, keep valuables hidden, use e-hailing near the entrance." };
  if (/sandton|bryanston|granger bay|waterfront/i.test(s))
    return { level: "Low", color: "emerald", note: "Area generally safe; standard nightlife caution applies." };
  return { level: "Medium", color: "amber", note: "Be aware of surroundings; prefer e-hailing over walking late." };
}

export default function SafetyPanel({ event }) {
  const { level, color, note } = assessRisk(event.city, event.venue);
  const tone = {
    emerald: "bg-emerald-500/20 text-emerald-300",
    amber: "bg-amber-500/20 text-amber-300",
    rose: "bg-rose-500/20 text-rose-300",
  }[color] || "bg-amber-500/20 text-amber-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          <div className="font-semibold">Area advisory</div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${tone}`}>Risk: {level}</span>
      </div>
      <div className="mt-2 text-sm text-slate-300 flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 opacity-70" />
        <span>{note}</span>
      </div>
    </div>
  );
}
