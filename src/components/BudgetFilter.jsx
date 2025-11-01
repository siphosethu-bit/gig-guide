// src/components/BudgetFilter.jsx
import React from "react";
import { Ticket } from "lucide-react";

export default function BudgetFilter({ budget, setBudget, enabled, setEnabled }) {
  return (
    <div className="card-dark px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Ticket className="h-5 w-5" />
        <div className="font-semibold">Event Budget</div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-300">
          Max ticket price (R):
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value || 0))}
          className="w-28 bg-black/30 border border-white/15 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      <label className="ml-auto inline-flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-amber-400"
        />
        Only show events I can afford
      </label>
    </div>
  );
}
