// src/components/Celebrate.jsx
import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

/**
 * Full-screen confetti overlay.
 * Spawns N floating pieces + emoji for ~2s, then self-cleans when unmounted.
 */
export default function Celebrate({ pieces = 160, emojis = ["🎉", "🎊", "✨"] }) {
  const container = useMemo(() => {
    const el = document.createElement("div");
    el.className =
      "fixed inset-0 z-[80] pointer-events-none overflow-hidden celebration-overlay";
    return el;
  }, []);

  useEffect(() => {
    document.body.appendChild(container);
    spawnConfetti(container, pieces, emojis);
    return () => {
      try { document.body.removeChild(container); } catch {}
    };
  }, [container, pieces, emojis]);

  return createPortal(null, container);
}

function spawnConfetti(root, pieces, emojis) {
  const colors = ["#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#F9C74F", "#90BE6D"];
  const total = Math.max(40, pieces);

  for (let i = 0; i < total; i++) {
    const el = document.createElement("div");
    const isEmoji = Math.random() < 0.18; // ~18% emojis
    el.className = "confetti-piece";
    el.style.left = Math.round(Math.random() * 100) + "vw";
    el.style.top = "-6vh";

    const rot = Math.round(Math.random() * 360);
    const dur = 1400 + Math.random() * 900;        // 1.4s – 2.3s
    const delay = Math.random() * 150;             // small stagger
    el.style.setProperty("--rot", `${rot}deg`);
    el.style.setProperty("--dur", `${dur}ms`);
    el.style.setProperty("--delay", `${delay}ms`);
    el.style.setProperty("--x", `${-30 + Math.random() * 60}vw`); // drift
    el.style.setProperty("--y", `${90 + Math.random() * 15}vh`);  // fall past screen

    if (isEmoji) {
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.classList.add("confetti-emoji");
    } else {
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = 8 + Math.random() * 8 + "px";
      el.style.height = 10 + Math.random() * 14 + "px";
    }

    root.appendChild(el);

    // cleanup after animation
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, dur + delay + 300);
  }
}
