// src/components/LiveBackgroundSafe.jsx
import React from "react";

// Tailwind-friendly animated gradient + subtle noise layer.
// No JS instances, no destroy/dispose/remove calls.
export default function LiveBackgroundSafe({ className = "" }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(45%_60%_at_30%_20%,rgba(255,214,0,0.20),transparent),radial-gradient(40%_55%_at_70%_60%,rgba(0,255,209,0.18),transparent)] animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
           style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>')" }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { filter: hue-rotate(0deg) blur(0px); transform: scale(1); }
          50%      { filter: hue-rotate(15deg) blur(0.5px); transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
