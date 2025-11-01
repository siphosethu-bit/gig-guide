// src/components/TargetCursor.jsx
import React, { useEffect, useRef } from "react";

export default function TargetCursor({
  spinDuration = 2,
  hideDefaultCursor = true,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // follow the mouse by updating left/top (keep transform only for centering)
    const onMove = (e) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // style when hovering over .cursor-target
    const onEnter = () => el.classList.add("is-target");
    const onLeave = () => el.classList.remove("is-target");
    const targets = Array.from(document.querySelectorAll(".cursor-target"));
    targets.forEach((t) => {
      t.addEventListener("mouseenter", onEnter);
      t.addEventListener("mouseleave", onLeave);
    });

    // hide the native cursor everywhere while active
    if (hideDefaultCursor) {
      document.documentElement.classList.add("gg-hide-cursor");
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      targets.forEach((t) => {
        t.removeEventListener("mouseenter", onEnter);
        t.removeEventListener("mouseleave", onLeave);
      });
      if (hideDefaultCursor) {
        document.documentElement.classList.remove("gg-hide-cursor");
      }
    };
  }, [hideDefaultCursor, spinDuration]);

  return (
    <>
      <div ref={ref} className="gg-cursor" aria-hidden>
        <span className="ring" />
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
      </div>

      <style>{`
        /* hide OS cursor globally while the component is mounted */
        .gg-hide-cursor, .gg-hide-cursor * { cursor: none !important; }

        .gg-cursor {
          position: fixed;
          top: 0; left: 0;
          width: 24px; height: 24px;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
        }

        .gg-cursor .ring {
          position: absolute; inset: 0;
          border: 2px solid rgba(255,255,255,.9);
          border-radius: 9999px;
          transition: transform .18s ease, border-color .18s ease, opacity .18s ease;
        }

        /* 4 bracket corners */
        .gg-cursor .corner {
          position: absolute; width: 8px; height: 8px;
          border: 2px solid rgba(255,255,255,.9);
          opacity: .95;
        }
        .gg-cursor .corner.tl { top: -8px; left: -8px; border-right: 0; border-bottom: 0; border-top-left-radius: 4px; }
        .gg-cursor .corner.tr { top: -8px; right: -8px; border-left: 0; border-bottom: 0; border-top-right-radius: 4px; }
        .gg-cursor .corner.bl { bottom: -8px; left: -8px; border-right: 0; border-top: 0; border-bottom-left-radius: 4px; }
        .gg-cursor .corner.br { bottom: -8px; right: -8px; border-left: 0; border-top: 0; border-bottom-right-radius: 4px; }

        /* active (hovering .cursor-target) — spin + amber accent */
        .gg-cursor.is-target .ring {
          border-color: #fbbf24;
          animation: gg-spin ${spinDuration}s linear infinite;
        }

        @keyframes gg-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
