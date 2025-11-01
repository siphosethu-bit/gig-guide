// src/components/TicketsPanel.jsx
import React, { useMemo } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default function TicketsPanel({ event }) {
  // Use event.price as base; fall back to 120
  const base = Number(event.price || 120);

  // Fake inventory (keep your own if you already have these on the event)
  const sold = Number(event.tickets?.sold ?? 282);
  const left = Number(event.tickets?.left ?? 178);
  const total = sold + left;
  const fill = total ? sold / total : 0;

  // Dynamic price tiers (simple but convincing)
  const tier = fill < 0.3 ? 1 : fill < 0.6 ? 1.08 : fill < 0.85 ? 1.15 : 1.28;
  const current = Math.round(base * tier);

  // Projected rise window (in hours) — purely simulated
  const hoursToBump = fill < 0.6 ? 12 : fill < 0.85 ? 6 : 2;
  const next = Math.round(current * (fill < 0.85 ? 1.08 : 1.12));

  const barPct = Math.round(fill * 100);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-glow">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Tickets</div>
        <div className="text-sm text-slate-300">
          From <b>R{base}</b>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-300">{sold} sold</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{left} left</span>
        </div>
        <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 px-2 py-0.5 text-xs">
          <TrendingUp className="h-3.5 w-3.5" />
          Likely to rise to <b>R{next}</b> in ~{hoursToBump}h
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400"
          style={{ width: `${barPct}%` }}
        />
      </div>

      {/* price row */}
      <div className="mt-4 flex items-center justify-between">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-black/70 border border-white/10 px-4 py-2 text-sm hover:bg-black/60 glow-button btn-bounce"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("gg:open-ticket", { detail: { event } })
            );
            window.dispatchEvent(
              new CustomEvent("gg:set-ticket-price", {
                detail: { price: current },
              })
            );
          }}
        >
          Buy Ticket
        </button>

        <div className="text-lg">
          <span className="text-slate-300 mr-1">Current</span>
          <b>R{current}</b>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        Dynamic pricing is simulated for MVP and may differ at checkout.
      </div>
    </section>
  );
}
