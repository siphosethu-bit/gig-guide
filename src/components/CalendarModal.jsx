// src/components/CalendarModal.jsx
import React, { useMemo, useState } from "react";
import { X, Calendar as CalIcon, ChevronLeft, ChevronRight, MapPin, Clock4 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function parseDate(v) { const d = new Date(v); return isNaN(d) ? null : d; }
function startOfMonth(d) { const x = new Date(d); x.setDate(1); return x; }
function endOfMonth(d) { const x = new Date(d); x.setMonth(x.getMonth() + 1, 0); return x; }
function addMonths(d, m) { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; }
function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function dayKey(d) { return d.toISOString().slice(0, 10); } // YYYY-MM-DD

export default function CalendarModal({ open, onClose, events = [], onPick }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  // Index events by YYYY-MM-DD (skip invalid dates)
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const sd = parseDate(e?.start);
      if (!sd) continue; // skip bad rows instead of throwing
      const key = dayKey(sd);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const as = parseDate(a.start)?.getTime() ?? 0;
        const bs = parseDate(b.start)?.getTime() ?? 0;
        return as - bs;
      });
    }
    return map;
  }, [events]); // ← this is where `toISOString` used to throw if start was invalid :contentReference[oaicite:2]{index=2}

  // Build month grid
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const firstWeekday = (monthStart.getDay() + 6) % 7; // Monday=0
  const totalDays = firstWeekday + monthEnd.getDate();
  const cells = Array.from({ length: Math.ceil(totalDays / 7) * 7 }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - firstWeekday + i);
    return d;
  });

  const selKey = dayKey(selectedDay);
  const dayEvents = eventsByDay.get(selKey) || [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="max-w-6xl mx-auto mt-10 px-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar panel */}
              <div className="card-dark p-4 lg:col-span-2 relative overflow-hidden">
                {/* fun glow */}
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-extrabold">GG</div>
                    <div className="font-bold">Event Calendar</div>
                    <CalIcon className="h-5 w-5 text-slate-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10" onClick={() => setCursor(addMonths(cursor, -1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="text-sm min-w-[120px] text-center">
                      {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
                    </div>
                    <button className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10" onClick={() => setCursor(addMonths(cursor, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10"
                      onClick={() => {
                        setCursor(startOfMonth(new Date()));
                        setSelectedDay(new Date());
                      }}
                    >
                      Today
                    </button>
                    <button onClick={onClose} className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Week header */}
                <div className="grid grid-cols-7 text-xs text-slate-300 mb-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="px-2 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Month grid */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d, i) => {
                    const inMonth = d.getMonth() === cursor.getMonth();
                    const key = dayKey(d);
                    const evts = eventsByDay.get(key) || [];
                    const isSel = isSameDay(d, selectedDay);
                    const today = isSameDay(d, new Date());
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDay(new Date(d))}
                        className={[
                          "relative text-left p-2 rounded-xl h-24 overflow-hidden",
                          inMonth ? "bg-white/5 hover:bg-white/10" : "bg-white/3 text-slate-400",
                          isSel ? "ring-2 ring-amber-300/70" : "",
                          "transition",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${today ? "font-bold text-white" : ""}`}>{d.getDate()}</span>
                          {!!evts.length && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-300 text-black font-bold">{evts.length}</span>
                          )}
                        </div>

                        {/* event dots */}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {evts.slice(0, 4).map((e, idx) => (
                            <span key={idx} className="h-1.5 w-1.5 rounded-full" style={{ backgroundImage: "linear-gradient(180deg, #fde68a, #fbcfe8)" }} />
                          ))}
                        </div>

                        {/* subtle gradient gloss */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-white/0 to-white/5" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-slate-300">Tip: click a day to see events; click an event to open it on the main page.</div>
              </div>

              {/* Day details */}
              <div className="card-dark p-4">
                <div className="text-sm font-bold mb-2">
                  {selectedDay.toLocaleString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="space-y-2 max-h-[420px] overflow-auto glass-scroll">
                  {dayEvents.length === 0 && <div className="text-slate-400 text-sm">No events on this day.</div>}
                  {dayEvents.map((e) => {
                    const s = parseDate(e.start);
                    const ed = parseDate(e.end);
                    const sStr = s ? s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                    const eStr = ed ? ed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                    return (
                      <div
                        key={e.id}
                        className="rounded-xl p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                        onClick={() => {
                          onPick?.(e);
                          onClose?.();
                        }}
                      >
                        <div className="font-semibold">{e.name}</div>
                        <div className="text-xs text-slate-300 flex items-center gap-2">
                          <Clock4 className="h-3.5 w-3.5" />
                          {sStr} – {eStr}
                        </div>
                        <div className="text-xs text-slate-300 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {e.venue} • {e.city}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
