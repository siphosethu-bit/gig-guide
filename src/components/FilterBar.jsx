// src/components/FilterBar.jsx
import React from "react";
import { Wallet, Filter, Star, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Outdoor", "Beach", "Club", "Lounge", "Favourites"];

export default function FilterBar({
  category, setCategory,
  budgetEnabled, setBudgetEnabled,
  budgetMax, setBudgetMax,
  followingOnly, setFollowingOnly,
  sort, setSort,
  totalCount
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-xl p-3 md:p-4 shadow-lg">
      {/* top row: legend + result count */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <Legend />
        <div className="text-xs text-slate-300">{totalCount} results</div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={
                "px-3 py-1.5 rounded-full text-xs border transition " +
                (category === c
                  ? "bg-white text-black border-transparent"
                  : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10")
              }
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-white/10 mx-1 md:mx-2" />

        {/* Budget */}
        <label className="flex items-center gap-2 text-xs text-slate-200">
          <Wallet className="h-4 w-4 opacity-70" />
          <input
            type="checkbox"
            checked={budgetEnabled}
            onChange={(e) => setBudgetEnabled(e.target.checked)}
          />
          <span>Budget</span>
          <span className={`${budgetEnabled ? "opacity-100" : "opacity-40"} inline-flex items-center gap-2`}>
            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              disabled={!budgetEnabled}
              value={budgetMax}
              onChange={(e) => setBudgetMax(parseInt(e.target.value, 10))}
            />
            <span className="w-14 text-right tabular-nums">R{budgetMax}</span>
          </span>
        </label>

        {/* Following only */}
        <label className="flex items-center gap-2 text-xs text-slate-200">
          <Star className="h-4 w-4 opacity-70" />
          <input
            type="checkbox"
            checked={followingOnly}
            onChange={(e) => setFollowingOnly(e.target.checked)}
          />
          <span>Following only</span>
        </label>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <Filter className="h-4 w-4 opacity-70" />
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="soonest">Soonest</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="popular">Trending</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="text-[11px] md:text-xs text-slate-300 flex items-center gap-3">
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#34d399" }} />
        Upcoming
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#ffd000" }} />
        Starting soon
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#9a9a9a" }} />
        Closed
      </span>

      <span className="hidden md:inline-flex items-center gap-1 text-slate-400 ml-2">
        <Sparkles className="h-3.5 w-3.5" /> Tip: click pins to jump to cards
      </span>
    </div>
  );
}
