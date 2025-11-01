// src/components/ArtistInbox.jsx
import React from "react";
import { loadInbox, markRead } from "../lib/artist";
import { Mail, Phone, Check } from "lucide-react";

export default function ArtistInbox({ artistId }) {
  const [msgs, setMsgs] = React.useState(loadInbox(artistId));
  function onRead(id) {
    markRead(artistId, id);
    setMsgs(loadInbox(artistId));
  }
  const shell =
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4";

  return (
    <div className={shell}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Messages from organizers</div>
        <div className="text-xs text-slate-400">({msgs.length})</div>
      </div>
      {!msgs.length && (
        <div className="text-sm text-slate-400">No messages yet.</div>
      )}
      <ul className="space-y-3">
        {msgs.map((m) => (
          <li
            key={m.id}
            className={`rounded-xl p-3 border ${
              m.read ? "border-white/10" : "border-yellow-300/30"
            } bg-white/5`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{m.orgName || "Organizer"}</div>
              <div className="text-xs text-slate-400">
                {new Date(m.ts).toLocaleString()}
              </div>
            </div>
            <div className="text-sm mt-1">{m.body}</div>
            <div className="mt-2 flex gap-2 text-xs">
              {m.phone && (
                <a
                  href={`tel:${m.phone}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 text-black"
                >
                  <Phone className="h-3 w-3" />
                  Call
                </a>
              )}
              {m.email && (
                <a
                  href={`mailto:${m.email}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20"
                >
                  <Mail className="h-3 w-3" />
                  Email
                </a>
              )}
              {!m.read && (
                <button
                  onClick={() => onRead(m.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20"
                >
                  <Check className="h-3 w-3" />
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
