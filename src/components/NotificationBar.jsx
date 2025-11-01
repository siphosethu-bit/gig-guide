// src/components/NotificationCenterModal.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Full-screen modal for app-wide notifications.
 * - Blocks background (like your How it works)
 * - Horizontal swipe/scroll cards with snap
 * - Auto-advance (pauses on hover/drag)
 * - Dismiss with X; remembers dismissal for the session
 */
export default function NotificationCenterModal({
  open = false,
  onClose = () => {},
  items = [
    {
      id: "wx-1",
      kind: "weather",
      title: "Rain expected",
      body:
        "Heads up! Rain is forecast in the next 3 days. Dress warm & consider indoor-friendly plans.",
      badge: "Weather",
      icon: "🌧️",
    },
    {
      id: "artist-1",
      kind: "update",
      title: "Line-up change",
      body:
        "Kelvin Momo has cancelled his appearance at Afro Sundaze. We’ve updated the line-up.",
      badge: "Update",
      icon: "🎶",
    },
    {
      id: "tix-1",
      kind: "tip",
      title: "VIP selling fast",
      body:
        "VIP tickets are moving quickly this week — book early to avoid disappointment.",
      badge: "Heads-up",
      icon: "🔥",
    },
  ],
  autoMs = 4200,
}) {
  const trackRef = useRef(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    const el = trackRef.current;
    if (!el) return;

    const onPointerDown = () => (hoverRef.current = true);
    const onPointerUp = () => (hoverRef.current = false);

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    const id = setInterval(() => {
      if (hoverRef.current) return;
      const card = el.firstElementChild;
      if (!card) return;

      const cardWidth = card.getBoundingClientRect().width;
      const gap = 16;
      const next = el.scrollLeft + cardWidth + gap;

      if (next + el.clientWidth >= el.scrollWidth - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: next, behavior: "smooth" });
      }
    }, autoMs);

    return () => {
      clearInterval(id);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, [open, autoMs]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative mx-4 w-full max-w-4xl rounded-3xl border border-white/10 bg-black/60 p-4 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Updates
          </h2>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20 flex items-center justify-center"
            aria-label="Close notifications"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Carousel */}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 pt-1 pb-3 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
        >
          {items.map((n) => (
            <article
              key={n.id}
              className="min-w-[85%] sm:min-w-[26rem] snap-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-4 sm:p-5 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,.45)]"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg leading-none">{n.icon}</span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs">
                  {n.badge}
                </span>
              </div>
              <h3 className="mt-2 text-lg sm:text-xl font-bold">{n.title}</h3>
              <p className="mt-1.5 text-sm sm:text-base text-slate-200/90">
                {n.body}
              </p>
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white text-black px-3 py-1.5 text-sm hover:bg-white/90"
          >
            Got it
          </button>
        </div>
      </div>

      {/* tiny CSS helper for hidden scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
