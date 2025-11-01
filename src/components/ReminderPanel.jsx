// src/components/ReminderPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  addReminder,
  cancelRemindersForEvent,
  getRemindersForEvent,
  toISOFromLocalDatetime,
} from "../lib/reminders";

const PRESETS = [
  { key: "AT_START", label: "At start time", minutes: 0 },
  { key: "H1", label: "1 hour before", minutes: 60 },
  { key: "H3", label: "3 hours before", minutes: 180 },
  { key: "D1", label: "1 day before", minutes: 1440 },
  { key: "CUSTOM", label: "Custom…", minutes: null },
];

export default function ReminderPanel({ event, onCreated, onCleared }) {
  const [choice, setChoice] = useState(PRESETS[1].key); // default 1h
  const [custom, setCustom] = useState(""); // datetime-local
  const [existing, setExisting] = useState([]);

  const startsAt = useMemo(() => new Date(event.start), [event.start]);

  useEffect(() => {
    setExisting(getRemindersForEvent(event.id));
  }, [event.id]);

  function ensurePermission() {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }

  function schedule() {
    let whenISO;
    if (choice === "CUSTOM") {
      if (!custom) return;
      whenISO = toISOFromLocalDatetime(custom);
    } else {
      const preset = PRESETS.find((p) => p.key === choice);
      const when = new Date(startsAt.getTime() - (preset.minutes || 0) * 60000);
      whenISO = when.toISOString();
    }
    const r = addReminder({
      eventId: event.id,
      title: event.name,
      whenISO,
    });
    setExisting(getRemindersForEvent(event.id));
    ensurePermission();
    onCreated?.(r);
  }

  function clearAll() {
    cancelRemindersForEvent(event.id);
    setExisting([]);
    onCleared?.();
  }

  const nextTime =
    existing.length > 0
      ? new Date(
          [...existing].sort(
            (a, b) => Date.parse(a.whenISO) - Date.parse(b.whenISO)
          )[0].whenISO
        ).toLocaleString()
      : null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-glow">
      <div className="flex items-center gap-2 font-semibold">
        <Bell className="h-5 w-5" />
        Reminders
      </div>

      {existing.length ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-300">
            You have <b>{existing.length}</b> reminder
            {existing.length > 1 ? "s" : ""} set
            {nextTime ? (
              <>
                {" "}
                • next: <span className="text-amber-300">{nextTime}</span>
              </>
            ) : null}
          </div>
          <button
            onClick={clearAll}
            className="text-xs inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10 glow-button"
          >
            <BellOff className="h-4 w-4" />
            Clear
          </button>
        </div>
      ) : (
        <div className="mt-3 grid gap-3">
          <div className="grid sm:grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <label
                key={p.key}
                className={`text-xs inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition glow-button ${
                  choice === p.key
                    ? "border-amber-300/40 bg-amber-300/10"
                    : "border-white/15 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="rem-choice"
                  value={p.key}
                  checked={choice === p.key}
                  onChange={() => setChoice(p.key)}
                />
                {p.label}
              </label>
            ))}
          </div>

          {choice === "CUSTOM" && (
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={schedule}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-black px-3 py-2 text-sm font-semibold hover:scale-[1.02] transition glow-button btn-bounce"
            >
              <Bell className="h-4 w-4" /> Set reminder
            </button>
            <div className="text-xs text-slate-400 self-center">
              Event start: {startsAt.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
