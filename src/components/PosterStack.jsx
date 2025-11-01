// src/components/PosterStack.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import EventCard from "./EventCard";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SwipeHint from "./SwipeHint";

export default function PosterStack({ events, onActiveChange, trendingIds = new Set() }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0); // -1 left, +1 right
  const count = events.length;
  const active = events[index];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-4, 0, 4]);

  useEffect(() => {
    onActiveChange?.(active);
  }, [index]); // eslint-disable-line

  const next = () => {
    setDir(1);
    setIndex((i) => (i + 1) % count);
  };
  const prev = () => {
    setDir(-1);
    setIndex((i) => (i - 1 + count) % count);
  };

  const variants = {
    enter: (d) => ({
      x: d > 0 ? 80 : -80,
      opacity: 0,
      rotateY: d > 0 ? -12 : 12,
      scale: 0.98,
    }),
    center: { x: 0, opacity: 1, rotateY: 0, scale: 1 },
    exit: (d) => ({
      x: d > 0 ? -80 : 80,
      opacity: 0,
      rotateY: d > 0 ? 12 : -12,
      scale: 0.98,
    }),
  };

  const glow = active?.accentColor || "#8b5cf6";

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        className="relative h-[620px] w-full max-w-[820px] overflow-hidden rounded-2xl
        bg-gradient-to-b from-slate-900/80 to-slate-800/80 border border-slate-700/60
        shadow-lg backdrop-blur-xl"
      >
        <SwipeHint />
        <AnimatePresence custom={dir} initial={false} mode="popLayout">
          <motion.div
            key={active.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute inset-0 flex items-center justify-center"
            drag="x"
            dragElastic={0.35}
            onDragEnd={(e, info) => {
              const threshold = 120;
              if (info.offset.x > threshold) prev();
              else if (info.offset.x < -threshold) next();
            }}
            style={{
              x,
              rotate,
              filter: `drop-shadow(0 0 16px ${glow}66)`,
            }}
          >
            <EventCard
              event={active}
              trending={trendingIds.has(active.id)} // ⭐ mark trending
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={prev}>
          <ChevronLeft className="h-5 w-5 mr-2" /> Prev
        </Button>
        <div className="text-sm text-slate-300">
          {index + 1} / {count}
        </div>
        <Button variant="outline" onClick={next}>
          Next <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
