import React, { useMemo } from "react";

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export default function CalendarMini({ events = [], onPickDate }) {
  const today = new Date();

  const { monthStart, monthEnd, days, eventDates } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // dates that have events
    const ed = new Set(
      events.map(e => {
        const d = new Date(e.start);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
      })
    );

    // build grid (starts Monday)
    const grid = [];
    const startWeekday = (start.getDay() + 6) % 7; // 0 = Mon
    for (let i = 0; i < startWeekday; i++) grid.push(null);

    for (let d = 1; d <= end.getDate(); d++) {
      grid.push(new Date(start.getFullYear(), start.getMonth(), d));
    }
    while (grid.length % 7 !== 0) grid.push(null);

    return { monthStart: start, monthEnd: end, days: grid, eventDates: ed };
  }, [events]);

  const monthLabel = monthStart.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="card-dark p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{monthLabel}</div>
        <div className="text-xs text-slate-400">Tap a date to filter</div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs mb-1 text-slate-300">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="h-8" />;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const hasEvent = eventDates.has(d.toDateString());
          const isToday = sameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => onPickDate?.(d)}
              className={[
                "h-8 rounded-lg border border-white/10 hover:bg-white/10 transition",
                isWeekend ? "bg-white/5" : "bg-transparent",
                hasEvent ? "ring-1 ring-amber-400/60" : "",
                isToday ? "outline outline-2 outline-white/60" : ""
              ].join(" ")}
              title={hasEvent ? "Events this day" : ""}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-300">
        <span className="inline-block w-3 h-3 rounded ring-1 ring-amber-400/60" /> Event day
        <span className="inline-block w-3 h-3 rounded outline outline-2 outline-white/60" /> Today
        <span className="inline-block w-3 h-3 rounded bg-white/5" /> Weekend
      </div>
    </div>
  );
}
