// src/components/ArtistProfile.jsx
import React from "react";
import { X, CalendarDays } from "lucide-react";
import { byId, resolveEventArtistIds } from "../lib/artistIndex";
import ArtistFollowButton from "./ArtistFollowButton";
import EventCard from "./EventCard";

export default function ArtistProfile({ open, onClose, artistId, events }) {
  if (!open || !artistId) return null;

  const a = byId(artistId);
  if (!a) return null;

  const now = Date.now();
  const withThisArtist = (events || []).filter((e) =>
    resolveEventArtistIds(e).includes(artistId)
  );
  const upcoming = withThisArtist.filter(
    (e) => new Date(e.start).getTime() >= now
  );
  const past = withThisArtist
    .filter((e) => new Date(e.start).getTime() < now)
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header / banner */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img
            src={a.banner}
            alt=""
            className="h-48 w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0" />
          <button
            className="absolute top-3 right-3 rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10"
            onClick={onClose}
            aria-label="Close artist profile"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-4 flex items-end gap-4">
            <img
              src={a.avatar}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover border border-white/20"
            />
            <div className="flex-1">
              <div className="text-2xl font-extrabold tracking-tight">
                {a.name}
              </div>
              <div className="text-sm text-slate-300">
                {a.genre?.join(" • ")}
              </div>
            </div>
            <ArtistFollowButton id={a.id} size="md" />
          </div>
        </div>

        {/* Lists */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <section className="card-dark p-4">
            <div className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-4 w-4" /> Upcoming events
            </div>
            <div className="mt-4 space-y-3">
              {upcoming.length ? (
                upcoming.map((e) => <EventCard key={e.id} event={e} compact />)
              ) : (
                <div className="text-sm text-slate-400">
                  No upcoming events yet.
                </div>
              )}
            </div>
          </section>

          <section className="card-dark p-4">
            <div className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-4 w-4" /> Past events
            </div>
            <div className="mt-4 space-y-3">
              {past.length ? (
                past.map((e) => <EventCard key={e.id} event={e} compact />)
              ) : (
                <div className="text-sm text-slate-400">
                  No past events logged.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* About */}
        <section className="card-dark p-4 mt-6">
          <div className="font-semibold mb-2">About</div>
          <p className="text-sm text-slate-300 leading-relaxed">{a.bio}</p>
          {a.socials && (
            <div className="mt-4 flex gap-3 text-sm">
              {a.socials.ig && (
                <a
                  className="underline text-slate-200"
                  href={a.socials.ig}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              )}
              {a.socials.x && (
                <a
                  className="underline text-slate-200"
                  href={a.socials.x}
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
