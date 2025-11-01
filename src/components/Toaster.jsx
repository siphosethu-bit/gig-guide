// src/components/Toaster.jsx
import React, { useEffect } from "react";
import { PartyPopper } from "lucide-react";

export default function Toaster({ items, onClose }) {
  // auto-hide each toast after 4s
  useEffect(() => {
    const timers = items.map((t) =>
      setTimeout(() => onClose?.(t.id), t.timeout ?? 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [items, onClose]);

  return (
    <div className="fixed z-[80] bottom-5 left-5 space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border border-white/10 bg-black/80 backdrop-blur px-3 py-2 text-sm text-slate-100 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <PartyPopper className="h-4 w-4 text-amber-300" />
            <div className="font-semibold">{t.title}</div>
          </div>
          {t.body && <div className="text-slate-300 text-xs mt-1">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}
