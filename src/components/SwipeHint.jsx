// src/components/SwipeHint.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const KEY = "gg:seenSwipeHint";

export default function SwipeHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(KEY);
    if (!seen) {
      setShow(true);
      const id = setTimeout(() => {
        setShow(false);
        localStorage.setItem(KEY, "1");
      }, 3500);
      return () => clearTimeout(id);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-full bg-white/15 text-white p-2 backdrop-blur-md"
            animate={{ x: [-6, 0, -6] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.div>
          <motion.div
            className="rounded-full bg-white/15 text-white p-2 backdrop-blur-md"
            animate={{ x: [6, 0, 6] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <ChevronRight className="h-6 w-6" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
