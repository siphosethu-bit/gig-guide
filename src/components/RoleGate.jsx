// src/components/RoleGate.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper, Megaphone, Lock, Sparkles } from "lucide-react";

/**
 * RoleGate (second-image theme + explore button)
 * - Title "Who are you?" (like your second screenshot)
 * - Both actions use the same pill/outline button style
 * - Left: "Explore events" -> onPick("attend")
 * - Right: "Manage events" -> password prompt -> onPick("post")
 * - Added artist role
 * - Keeps glass / rounded / soft-border theme
 */
export default function RoleGate({ onPick }) {
  const [askingPwd, setAskingPwd] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const pillBtn =
    "w-full sm:w-auto rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm " +
    "backdrop-blur hover:bg-white/15 transition";

  function openOrganizer() {
    setAskingPwd(true);
  }

  function submitPwd(e) {
    e.preventDefault();
    if (pwd === "12345") {
      onPick?.("post"); // backward-compatible
    } else {
      setErr("Incorrect password.");
    }
  }

  function cancelPwd() {
    setAskingPwd(false);
    setPwd("");
    setErr("");
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[min(980px,100%)] rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl"
      >
        {/* Header like the second image */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Who are you?</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Left card: attendee */}
          <div className="rounded-2xl border border-white/12 bg-white/6 p-6">
            <div className="flex items-center gap-3">
              <PartyPopper className="h-5 w-5 text-amber-300" />
              <div className="text-lg font-semibold">I’m looking for events</div>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Browse posters, maps, ride estimates & safety tips.
            </p>

            <div className="mt-5">
              <button
                onClick={() => onPick?.("attend")}
                className={pillBtn}
                title="Explore events"
              >
                Explore events
              </button>
            </div>
          </div>

          {/* Middle card: artist */}
          <div className="rounded-2xl border border-white/12 bg-white/6 p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-amber-300" />
              <div className="text-lg font-semibold">I’m an Artist</div>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Post upcoming gigs, view collaborations, and more.
            </p>

            <div className="mt-5">
              <button
                onClick={() => onPick?.("artist")}
                className={pillBtn}
                title="Artist dashboard"
              >
                Manage events
              </button>
            </div>
          </div>

          {/* Right card: organizer (with password step) */}
          <div className="rounded-2xl border border-white/12 bg-white/6 p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-amber-300" />
              <div className="text-lg font-semibold">I’m an event organizer</div>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Manage events, post new gigs, and view analytics.
            </p>

            {!askingPwd ? (
              <div className="mt-5">
                <button
                  onClick={openOrganizer}
                  className={pillBtn}
                  title="Organizer dashboard"
                >
                  Manage events
                </button>
              </div>
            ) : (
              <form onSubmit={submitPwd} className="mt-4 space-y-2">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Organizer password
                </label>
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Enter password"
                />
                {err && <div className="text-xs text-rose-300">{err}</div>}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="submit" className={pillBtn + " bg-white/20"}>
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={cancelPwd}
                    className={pillBtn + " border-white/15"}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          You can switch roles anytime from the header menu.
        </p>
      </motion.div>
    </div>
  );
}
