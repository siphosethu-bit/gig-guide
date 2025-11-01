// src/components/ChatWidget.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import eventsData from "../data/events.json";
import { getUserEvents } from "../lib/userEvents";

const SUGGESTIONS = [
  "Which events fit R200 this weekend?",
  "I like amapiano + outdoor vibes, what’s recommended?",
  "Show only Soweto events with VIP Lounge.",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Hey! I’m your party guide. Ask me about budget, location, or vibes 🎉" },
  ]);
  const logEnd = useRef(null);

  const mergedEvents = useMemo(() => {
    const user = getUserEvents();
    const merged = [...eventsData, ...user];
    return merged.sort((a, b) => new Date(a.start) - new Date(b.start));
  }, []);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  function send() {
    const q = input.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    const res = answer(q, mergedEvents);
    setMsgs((m) => [...m, res]);
  }

  return (
    <>
      <button
        className="fixed z-[70] bottom-6 right-6 rounded-full bg-amber-400 text-black px-4 py-3 shadow-xl hover:scale-105 transition"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="inline h-5 w-5 mr-2" />
        Help
      </button>

      {open && (
        <div className="fixed z-[80] bottom-24 right-6 w-[360px] max-w-[90vw] rounded-2xl border border-white/10 bg-black/70 backdrop-blur shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="font-semibold">AI Party Guide</div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[360px] overflow-auto p-3 space-y-2 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 ${m.role === "ai" ? "bg-white/5" : "bg-amber-400/20 text-amber-200 border border-amber-300/30"}`}
              >
                {Array.isArray(m.text)
                  ? m.text.map((t, j) => <div key={j}>{t}</div>)
                  : m.text}
                {m.events && m.events.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.events.map((e) => (
                      <div key={e.id} className="rounded-lg border border-white/10 p-2 flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{e.name}</div>
                          <div className="text-xs text-slate-300">
                            {e.venue} • {e.city} • {new Date(e.start).toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            // tell App to focus this event
                            window.dispatchEvent(new CustomEvent("gg:focus-event", { detail: { id: e.id } }));
                          }}
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={logEnd} />
          </div>

          <div className="px-3 pb-3">
            <div className="flex gap-2 mb-2 flex-wrap">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs rounded-full border border-white/15 px-3 py-1 hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about budget, location, vibes…"
                className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 outline-none"
              />
              <button
                onClick={send}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-black px-3 py-2 text-sm font-semibold hover:scale-[1.02] transition"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ----------------- Simple rule-based concierge ----------------- */
function answer(q, events) {
  const text = q.toLowerCase();

  // budget extraction
  const budgetMatch = text.match(/r?\s?(\d{2,5})/);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  // time / weekend
  const wantsWeekend = /weekend|sat|saturday|sun|sunday/i.test(q);

  // location
  const locMatch = text.match(/in\s+([a-zA-Z\s]+)$/) || text.match(/(soweto|sandton|durban|cape town|pretoria|joburg|johannesburg)/i);
  const location = locMatch ? locMatch[1].toLowerCase() : null;

  // vibe / activities
  const wantVip = /vip/i.test(text);
  const wantOutdoor = /outdoor/i.test(text);
  const wantAmapiano = /amapiano/i.test(text);

  let list = [...events];

  if (wantsWeekend) {
    const now = new Date();
    const nextSunday = new Date(now);
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const toSaturday = (6 - day + 7) % 7;
    const toSunday = (7 - day) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() + (day <= 5 ? (5 - day) : 0)); // Friday if before
    const end = new Date(now);
    end.setDate(now.getDate() + toSunday);
    list = list.filter((e) => {
      const t = new Date(e.start).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }

  if (location) {
    list = list.filter((e) => `${e.city} ${e.venue}`.toLowerCase().includes(location));
  }
  if (wantVip) {
    list = list.filter((e) => (e.activities || []).join(" ").toLowerCase().includes("vip"));
  }
  if (wantOutdoor) {
    list = list.filter((e) => (e.activities || []).join(" ").toLowerCase().includes("outdoor"));
  }
  if (wantAmapiano) {
    list = list.filter((e) =>
      (e.lineup || []).join(" ").toLowerCase().includes("maphorisa") ||
      (e.lineup || []).join(" ").toLowerCase().includes("kabza") ||
      (e.activities || []).join(" ").toLowerCase().includes("amapiano")
    );
  }

  if (budget) {
    // very rough: show events with base price <= budget
    list = list.filter((e) => Number(e.price || 120) <= budget);
  }

  list = list.slice(0, 5);

  if (!list.length) {
    return { role: "ai", text: "I didn’t find a perfect match. Try widening the budget or removing a filter (VIP/outdoor/location)." };
  }

  return {
    role: "ai",
    text: [`Here’s what I’d suggest (${list.length}):`],
    events: list,
  };
}
