// src/components/EventModal.jsx
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, CalendarDays, Ticket, Star } from "lucide-react";

export default function EventModal({ open, event, onClose, onOpenMaps, onBuy }) {
  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && event && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Card */}
          <motion.div
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="relative w-full max-w-3xl rounded-3xl border border-white/12 bg-white/7 backdrop-blur-2xl shadow-[0_20px_120px_-20px_rgba(0,0,0,.7)] overflow-hidden">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/60 text-white p-2 border border-white/10 hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Poster */}
              {event.posterImage && (
                <div className="h-52 sm:h-64 w-full bg-cover bg-center"
                     style={{ backgroundImage: `url(${event.posterImage})` }} />
              )}

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {event.name}
                    </h2>
                    <div className="mt-1 text-sm text-slate-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4 opacity-70" />
                      <span>{event.venue} • {event.city}</span>
                    </div>
                  </div>
                  {event.rating && (
                    <div className="hidden sm:flex items-center gap-1 text-amber-300">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">{event.rating.toFixed?.(1)}</span>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoPill
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="When"
                    value={`${fmt(event.start)} – ${fmt(event.end || event.start)}`}
                  />
                  {typeof event.price === "number" && (
                    <InfoPill
                      icon={<Ticket className="h-4 w-4" />}
                      label="From"
                      value={`R${event.price}`}
                    />
                  )}
                </div>

                {/* Tags / activities */}
                {!!(event.activities?.length) && (
                  <div className="flex flex-wrap gap-2">
                    {event.activities.map((a) => (
                      <span key={a}
                            className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-200">
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {event.position && (
                    <a
                      className="btn-ghost"
                      href={`https://www.google.com/maps/search/?api=1&query=${event.position.lat},${event.position.lng}`}
                      target="_blank" rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  )}
                  <button className="btn-primary" onClick={() => onBuy?.(event)}>
                    Buy Ticket
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
        {icon}{label}
      </div>
      <div className="text-sm mt-1 text-slate-100">{value}</div>
    </div>
  );
}

function fmt(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  } catch { return d; }
}

/* Tailwind helpers (use in your global styles or keep as utility classes)
.btn-primary { @apply inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-white text-black border border-white/10 hover:bg-slate-100; }
.btn-ghost   { @apply inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10; }
*/
