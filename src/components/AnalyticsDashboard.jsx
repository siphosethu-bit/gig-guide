// src/components/ArtistDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import ArtistGigForm from "./ArtistGigForm";
import ArtistInbox from "./ArtistInbox";
import { loadGigs, deleteGig, loadFollowers, seedFollowers, loadViews, bumpViews } from "../lib/artist";
import { ArrowLeft, ExternalLink, Users2, Eye, Trash2, Share2, Ticket } from "lucide-react";

export default function ArtistDashboard({ artistId, artistName, onClose, allEvents=[] }) {
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { seedFollowers(artistId); }, [artistId]);
  useEffect(() => { bumpViews(artistId, 3); }, [artistId]); // demo: simulate views

  const followers = loadFollowers(artistId);
  const views = loadViews(artistId);

  const gigs = useMemo(() => {
    const xs = loadGigs(artistId);
    const now = Date.now();
    const upcoming = xs.filter(g => new Date(g.start).getTime() >= now)
                       .sort((a,b)=>new Date(a.start)-new Date(b.start));
    const past = xs.filter(g => new Date(g.start).getTime() < now)
                   .sort((a,b)=>new Date(b.start)-new Date(a.start));
    return { upcoming, past };
  }, [artistId, refresh]);

  const shell = "max-w-6xl mx-auto px-4 py-6";
  const card = "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5";

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className={shell + " py-4 flex items-center justify-between"}>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-xs inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4"/> Back
            </button>
            <div>
              <div className="font-extrabold text-lg">{artistName || "Artist"} — Dashboard</div>
              <div className="text-xs text-slate-300">Manage performances, messages & audience</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
              <Users2 className="h-4 w-4"/> {followers.length} followers
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
              <Eye className="h-4 w-4"/> {views} profile views
            </div>
          </div>
        </div>
      </header>

      <main className={shell + " space-y-6"}>
        {/* Post a new gig */}
        <ArtistGigForm artistId={artistId} onSaved={()=>setRefresh(x=>x+1)} />

        {/* Upcoming & past */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className={card}>
            <h3 className="font-semibold mb-3">Upcoming performances</h3>
            {gigs.upcoming.length ? (
              <ul className="space-y-3">
                {gigs.upcoming.map(g => <GigItem key={g.id} gig={g} onDelete={()=>{deleteGig(artistId,g.id); setRefresh(x=>x+1);}} />)}
              </ul>
            ) : <Empty text="No upcoming performances yet."/>}
          </div>

          <div className={card}>
            <h3 className="font-semibold mb-3">Past performances</h3>
            {gigs.past.length ? (
              <ul className="space-y-3">
                {gigs.past.map(g => <GigItem key={g.id} gig={g} past />)}
              </ul>
            ) : <Empty text="No past performances logged."/>}
          </div>
        </section>

        {/* Inbox */}
        <ArtistInbox artistId={artistId} />

        {/* Followers grid */}
        <section className={card}>
          <h3 className="font-semibold mb-3">Followers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {followers.map(f => (
              <div key={f.id} className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-center text-center">
                <img src={f.avatar} alt="" className="h-12 w-12 rounded-full mb-2 object-cover" />
                <div className="text-xs">{f.name}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-sm text-slate-400">
        Artist tools • v0.1 MVP
      </footer>
    </div>
  );
}

function GigItem({ gig, past=false, onDelete }) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">{gig.title}</div>
        {!past && onDelete && (
          <button onClick={onDelete} className="text-xs inline-flex items-center gap-1 rounded-lg border border-white/20 px-2 py-1 hover:bg-white/10">
            <Trash2 className="h-3 w-3"/> Remove
          </button>
        )}
      </div>
      <div className="text-xs text-slate-300 mt-1">
        {new Date(gig.start).toLocaleString()} {gig.end ? `– ${new Date(gig.end).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`:""}
      </div>
      <div className="text-sm mt-1">{gig.venue} • {gig.city}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {gig.ticketUrl && <a className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 text-black" href={gig.ticketUrl} target="_blank" rel="noreferrer"><Ticket className="h-3 w-3"/> Tickets</a>}
        {gig.posterUrl && <a className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20" href={gig.posterUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3"/> Poster</a>}
        <button onClick={()=>navigator.clipboard?.writeText(`${gig.title} • ${gig.venue}, ${gig.city} — ${new Date(gig.start).toLocaleString()}`)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20"><Share2 className="h-3 w-3"/> Copy blurb</button>
      </div>
      {gig.notes && <div className="mt-2 text-sm text-slate-200/90">{gig.notes}</div>}
      {gig.slotName && <div className="mt-1 text-xs text-slate-300">Slot: {gig.slotName}</div>}
    </li>
  );
}

function Empty({ text }) {
  return <div className="text-sm text-slate-400">{text}</div>;
}
