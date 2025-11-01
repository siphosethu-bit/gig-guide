// src/components/Countdown.jsx
import React, { useEffect, useState } from "react";

function diffParts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return { d, h, m };
}

export default function Countdown({ start, end }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  // live now
  if (now >= startMs && now < endMs) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-600 text-white px-3 py-1 text-xs font-bold shadow-lg shadow-green-500/40">
        ● Live now
      </span>
    );
  }

  // ended
  if (now >= endMs) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-700 text-gray-200 px-3 py-1 text-xs font-semibold">
        Ended
      </span>
    );
  }

  // starts in
  const { d, h, m } = diffParts(startMs - now);
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-700 text-white px-3 py-1 text-xs font-bold shadow-md shadow-indigo-500/50 animate-pulse">
      Starts in {d ? `${d}d ` : ""}{h ? `${h}h ` : ""}{m}m
    </span>
  );
}
