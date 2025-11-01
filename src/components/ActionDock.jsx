// src/components/ActionDock.jsx
import React, { useState } from "react";
import { Car, Ticket, Shield } from "lucide-react";
import UberButtons from "./UberButtons";
import TransitOptions from "./TransitOptions";
import TicketsPanel from "./TicketsPanel";
import SafetyPanel from "./SafetyPanel";

export default function ActionDock({ event }) {
  const [tab, setTab] = useState("rides"); // 'rides' | 'tickets' | 'safety'

  if (!event) return null;

  const tabs = [
    { id: "rides", label: "Rides", icon: <Car className="h-4 w-4" /> },
    { id: "tickets", label: "Tickets", icon: <Ticket className="h-4 w-4" /> },
    { id: "safety", label: "Safety", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="lg:sticky lg:top-24 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_120px_-20px_rgba(0,0,0,.55)]">
      {/* Tabs */}
      <div className="p-2 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm border transition " +
              (tab === t.id
                ? "bg-white text-black border-transparent"
                : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10")
            }
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="h-px bg-white/10" />

      {/* Panels */}
      <div className="p-4 space-y-4">
        {tab === "rides" && (
          <div className="space-y-4">
            <UberButtons event={event} />
            <TransitOptions event={event} />
          </div>
        )}

        {tab === "tickets" && <TicketsPanel event={event} />}

        {tab === "safety" && <SafetyPanel event={event} />}
      </div>
    </div>
  );
}
