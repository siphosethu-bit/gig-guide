// src/components/MyEventsModal.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function MyEventsModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="relative w-full max-w-2xl rounded-3xl border border-white/12 bg-white/7 backdrop-blur-2xl shadow-[0_20px_120px_-20px_rgba(0,0,0,.7)] p-6">
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-black/60 text-white p-2 border border-white/10 hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-2xl font-extrabold tracking-tight mb-2">My Events</h2>
              <p className="text-slate-300">
                Soon you’ll see the events you’ve saved or bought tickets for,
                and set/manage reminders right here. ✨
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
