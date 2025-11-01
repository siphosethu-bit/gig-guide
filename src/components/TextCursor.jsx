// src/components/TextCursor.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * TextCursor – leaves a fading trail of text/emoji behind the cursor,
 * mounted in a BODY-level portal so it always paints on top.
 *
 * Hardened cleanup: cancels timers, removes listeners, and never calls
 * non-existent .destroy() methods on anything.
 */
export default function TextCursor({
  text = "🎉",
  delay = 0.01,         // seconds between spawn checks
  spacing = 80,         // px of travel before next point can spawn
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.3,   // seconds
  removalInterval = 20, // ms
  maxPoints = 10,
}) {
  const [host, setHost] = useState(null);       // portal host
  const rootRef = useRef(null);                 // inner root for points
  const lastSpawnRef = useRef({ x: 0, y: 0, t: 0, init: false });
  const lastMoveRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef([]);
  const pruneTimerRef = useRef(null);

  // Create a BODY-level host element once
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-text-cursor", "1");
    Object.assign(el.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "2147483647", // absolute top
      mixBlendMode: "normal",
      contain: "layout style paint",
    });
    document.body.appendChild(el);
    setHost(el);

    return () => {
      // Defensive remove
      try { el.remove(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!host || !rootRef.current) return;

    const root = rootRef.current;
    const minDelayMs = Math.max(0, delay * 1000);

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    function spawnAt(x, y) {
      const node = document.createElement("span");
      node.className = "tc-point";
      node.textContent = text;

      Object.assign(node.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        willChange: "transform, opacity, filter",
        opacity: "0",
        transition: `transform ${exitDuration}s cubic-bezier(.2,.7,.3,1), opacity ${exitDuration}s linear, filter ${exitDuration}s linear`,
        userSelect: "none",
      });

      if (followMouseDirection) {
        const dx = x - lastMoveRef.current.x;
        const dy = y - lastMoveRef.current.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        node.style.rotate = `${angle}deg`;
      }

      // drift & scale
      let driftX = 0, driftY = 0, scale = 1;
      if (randomFloat) {
        const r = () => (Math.random() - 0.5) * 18;
        driftX = r(); driftY = r();
        scale = 0.9 + Math.random() * 0.3;
      }

      root.appendChild(node);
      node.getBoundingClientRect(); // force layout
      node.style.opacity = "1";
      node.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(${scale})`;
      node.style.filter = "blur(0px)";

      // schedule fade + remove
      const removeTimer = setTimeout(() => {
        node.style.opacity = "0";
        node.style.filter = "blur(3px)";
        const finalTimer = setTimeout(() => {
          try { node.remove(); } catch {}
        }, exitDuration * 1000);
        node.__finalTimer = finalTimer;
      }, 0);

      node.__removeTimer = removeTimer;
      pointsRef.current.push(node);
    }

    function onMove(e) {
      const now = performance.now();
      const p = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = p;

      if (!lastSpawnRef.current.init) {
        lastSpawnRef.current = { x: p.x, y: p.y, t: now, init: true };
        spawnAt(p.x, p.y);
        return;
      }
      const elapsed = now - lastSpawnRef.current.t;
      const traveled = dist(p, lastSpawnRef.current);
      if (elapsed >= minDelayMs && traveled >= spacing) {
        spawnAt(p.x, p.y);
        lastSpawnRef.current = { x: p.x, y: p.y, t: now, init: true };
      }
    }

    function onEnter(e) {
      const p = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = p;
      if (!lastSpawnRef.current.init) {
        lastSpawnRef.current = { x: p.x, y: p.y, t: performance.now(), init: true };
        spawnAt(p.x, p.y);
      }
    }

    // prune overflow so DOM stays tiny
    function startPruneLoop() {
      stopPruneLoop();
      const tick = () => {
        const overflow = Math.max(0, pointsRef.current.length - maxPoints);
        if (overflow) {
          const old = pointsRef.current.splice(0, overflow);
          old.forEach((n) => {
            clearTimeout(n.__removeTimer);
            clearTimeout(n.__finalTimer);
            try { n.remove(); } catch {}
          });
        }
        pruneTimerRef.current = setTimeout(tick, Math.max(8, removalInterval));
      };
      tick();
    }
    function stopPruneLoop() {
      if (pruneTimerRef.current) {
        clearTimeout(pruneTimerRef.current);
        pruneTimerRef.current = null;
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onEnter, { passive: true });
    startPruneLoop();

    return () => {
      // Remove listeners
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      // Stop prune loop
      stopPruneLoop();
      // Remove any remaining nodes safely
      pointsRef.current.forEach((n) => {
        clearTimeout(n.__removeTimer);
        clearTimeout(n.__finalTimer);
        try { n.remove(); } catch {}
      });
      pointsRef.current = [];
    };
  }, [
    host,
    text,
    delay,
    spacing,
    followMouseDirection,
    randomFloat,
    exitDuration,
    removalInterval,
    maxPoints,
  ]);

  if (!host) return null;

  // The portal markup (a single inner root for points)
  return createPortal(
    <>
      <div ref={rootRef} className="tc-root" aria-hidden />
      <style>{`
        [data-text-cursor="1"] .tc-root { position: fixed; inset: 0; pointer-events: none; }
        [data-text-cursor="1"] .tc-point {
          font-size: 18px;
          line-height: 1;
          text-shadow: 0 2px 10px rgba(0,0,0,.35);
          mix-blend-mode: normal;
        }
      `}</style>
    </>,
    host
  );
}
