// src/components/ArtistGigForm.jsx
import React, { useState } from "react";
import { saveGig } from "../lib/artist";
import { Calendar, MapPin, Clock, Link2, Music4 } from "lucide-react";

export default function ArtistGigForm({ artistId, onSaved }) {
  const [f, setF] = useState({
    title: "", venue: "", city: "", date: "", start: "", end: "",
    slotName: "", ticketUrl: "", posterUrl: "", notes: ""
  });

  function update(k, v) { setF(s => ({ ...s, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    const when = `${f.date} ${f.start || "00:00"}`;
    const gig = {
      title: f.title || "Performance",
      venue: f.venue, city: f.city,
      start: new Date(when).toISOString(),
      end: f.end ? new Date(`${f.date} ${f.end}`).toISOString() : null,
      slotName: f.slotName,
      ticketUrl: f.ticketUrl, posterUrl: f.posterUrl, notes: f.notes
    };
    const id = saveGig(artistId, gig);
    onSaved?.(id);
    setF({ title:"", venue:"", city:"", date:"", start:"", end:"", slotName:"", ticketUrl:"", posterUrl:"", notes:"" });
  }

  const shell = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 text-sm text-slate-200";

  return (
    <form onSubmit={submit} className={shell}>
      <div className="font-semibold mb-3">Post a new performance</div>

      <div className="grid sm:grid-cols-2 gap-3">
        <L label="Event title"><input className="gg-input" value={f.title} onChange={e=>update("title",e.target.value)} placeholder="Brews & Beats Fest" /></L>
        <L label={<span className="inline-flex items-center gap-2"><Music4 className="h-4 w-4"/>Slot</span>}>
          <input className="gg-input" value={f.slotName} onChange={e=>update("slotName",e.target.value)} placeholder="Main stage – 21:30" />
        </L>

        <L label={<span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4"/>Venue</span>}>
          <input className="gg-input" value={f.venue} onChange={e=>update("venue",e.target.value)} placeholder="FNB Stadium" />
        </L>
        <L label="City">
          <input className="gg-input" value={f.city} onChange={e=>update("city",e.target.value)} placeholder="Johannesburg" />
        </L>

        <L label={<span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4"/>Date</span>}>
          <input type="date" className="gg-input" value={f.date} onChange={e=>update("date",e.target.value)} />
        </L>
        <div className="grid grid-cols-2 gap-3">
          <L label={<span className="inline-flex items-center gap-2"><Clock className="h-4 w-4"/>Start</span>}>
            <input type="time" className="gg-input" value={f.start} onChange={e=>update("start",e.target.value)} />
          </L>
          <L label="End">
            <input type="time" className="gg-input" value={f.end} onChange={e=>update("end",e.target.value)} />
          </L>
        </div>

        <L label={<span className="inline-flex items-center gap-2"><Link2 className="h-4 w-4"/>Ticket link</span>}>
          <input className="gg-input" value={f.ticketUrl} onChange={e=>update("ticketUrl",e.target.value)} placeholder="https://tickets.co.za/..." />
        </L>
        <L label="Poster image URL">
          <input className="gg-input" value={f.posterUrl} onChange={e=>update("posterUrl",e.target.value)} placeholder="/posters/kabza-2025.png" />
        </L>

        <L label="Notes" span>
          <textarea className="gg-input min-h-[80px]" value={f.notes} onChange={e=>update("notes",e.target.value)} placeholder="Special guest, meet & greet at 8pm..." />
        </L>
      </div>

      <div className="mt-3 flex justify-end">
        <button className="px-4 py-2 rounded-xl bg-white/90 text-black font-semibold hover:bg-white">Save performance</button>
      </div>
    </form>
  );
}

function L({ label, children, span=false }) {
  return (
    <label className={`flex flex-col gap-1 ${span ? "sm:col-span-2":""}`}>
      <span className="text-xs text-slate-300">{label}</span>
      {children}
    </label>
  );
}
