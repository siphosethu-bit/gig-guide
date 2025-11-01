// src/components/ConfettiBurst.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ConfettiBurst({ fire, onDone }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (fire) {
      setShow(true);
      const id = setTimeout(() => { setShow(false); onDone?.(); }, 1200);
      return () => clearTimeout(id);
    }
  }, [fire, onDone]);
  if (!show) return null;

  const items = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const dist = 60 + Math.random() * 60;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist * 0.8;
    return (
      <motion.span
        key={i}
        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        animate={{ opacity: 0, x, y, scale: 0.9, rotate: (Math.random() - 0.5) * 120 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="absolute h-2 w-2 rounded-sm"
        style={{ background: ["#a78bfa","#22d3ee","#f472b6","#f59e0b","#34d399"][i % 5] }}
      />
    );
  });

  return <div className="pointer-events-none absolute inset-0">{items}</div>;
}
