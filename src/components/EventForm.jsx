// src/components/EventForm.jsx
import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { addUserEvent } from "../lib/userEvents";
import {
  CalendarDays,
  MapPin,
  Music4,
  Image as Img,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import Celebrate from "./Celebrate"; // 🎉

const required = (s) => s && String(s).trim().length > 0;
const split = (s) =>
  s ? s.split(",").map((v) => v.trim()).filter(Boolean) : [];

export default function EventForm({ onDone }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — Basics
    name: "",
    venue: "",
    city: "",
    start: "",
    end: "",
    lat: "",
    lng: "",

    // Step 2 — Details
    activities: "",
    menu: "",
    lineup: "",
    category: "",
    dressCode: "",
    priceMin: "",
    priceMax: "",
    ticketLink: "",
    earlyBird: false,
    age: "",
    capacity: "",
    safetyNotes: "",
    description: "",
    riskLabel: "", // NEW
    riskNotes: "", // NEW

    // Step 3 — Media & Org
    posterImage: "", // URL
    posterFile: null, // File -> dataURL
    promoVideo: "",
    vibeUrl: "", // NEW: music / vibe preview link (Spotify/MP3/etc)
    organizer: "",
    contact: "",
  });

  const update =
    (k) =>
    (e) =>
      setForm((f) => ({
        ...f,
        [k]:
          e?.target?.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  async function onPosterChange(e) {
    const file = e.target.files?.[0];
    if (!file) return setForm((f) => ({ ...f, posterFile: null }));
    const dataUrl = await fileToDataURL(file);
    setForm((f) => ({ ...f, posterFile: file, posterImage: dataUrl }));
  }

  function next() {
    setError("");
    if (step === 1) {
      const must = ["name", "venue", "city", "start", "end"];
      for (const k of must)
        if (!required(form[k])) return setError(`Please fill the ${k} field`);
    }
    if (step === 2) {
      // Optional validation: price numbers
      if (form.priceMin && isNaN(Number(form.priceMin)))
        return setError("Min price must be a number");
      if (form.priceMax && isNaN(Number(form.priceMax)))
        return setError("Max price must be a number");
      if (form.age && isNaN(Number(form.age)))
        return setError("Age restriction must be a number");
      if (form.capacity && isNaN(Number(form.capacity)))
        return setError("Capacity must be a number");
    }
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  function submit(e) {
    e.preventDefault();
    // Final guard
    const must = ["name", "venue", "city", "start", "end"];
    for (const k of must)
      if (!required(form[k])) return setError(`Please fill the ${k} field`);

    const id =
      String(form.name).toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Date.now();

    const avgPrice =
      form.priceMin && form.priceMax
        ? (Number(form.priceMin) + Number(form.priceMax)) / 2
        : form.priceMin
        ? Number(form.priceMin)
        : form.priceMax
        ? Number(form.priceMax)
        : undefined;

    const evt = {
      id,
      name: form.name,
      venue: form.venue,
      city: form.city,
      position: {
        lat: Number(form.lat) || undefined,
        lng: Number(form.lng) || undefined,
      },
      start: form.start,
      end: form.end,

      // Details
      activities: split(form.activities),
      menu: split(form.menu),
      lineup: split(form.lineup),
      category: form.category || undefined,
      dressCode: form.dressCode || undefined,
      priceMin: form.priceMin ? Number(form.priceMin) : undefined,
      priceMax: form.priceMax ? Number(form.priceMax) : undefined,
      price: avgPrice, // for budget filtering in the feed
      ticketLink: form.ticketLink || undefined,
      earlyBird: !!form.earlyBird,
      age: form.age ? Number(form.age) : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      safetyNotes: form.safetyNotes || undefined,
      riskLabel: form.riskLabel || undefined, // NEW
      riskNotes: form.riskNotes || undefined, // NEW
      description: form.description || undefined,

      // Media & Organizer
      posterImage: form.posterImage || undefined,
      promoVideo: form.promoVideo || undefined,
      vibeUrl: form.vibeUrl || undefined, // NEW
      organizer: form.organizer || undefined,
      contact: form.contact || undefined,
    };

    addUserEvent(evt);
    setCelebrate(true);
    setTimeout(() => onDone?.(evt), 2200);
  }

  const preview = useMemo(() => buildPreview(form), [form]);

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="card-dark relative overflow-hidden">
        {/* fun glows */}
        <div className="pointer-events-none absolute -top-40 -left-32 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 w-96 h-96 rounded-full bg-amber-300/10 blur-3xl" />

        <CardHeader>
          <h2 className="text-2xl font-extrabold">Post your event</h2>
          <p className="text-sm text-slate-300">
            Give party people everything they need: time, place, vibe, and
            price. Your event appears instantly.
          </p>
          <Stepper step={step} />
        </CardHeader>

        <CardContent>
          <form onSubmit={submit}>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* LEFT: Form fields */}
              <div className="space-y-4">
                {step === 1 && (
                  <Section
                    title="Basics"
                    icon={<CalendarDays className="h-4 w-4 text-amber-300" />}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <L
                        label="Event name"
                        v={form.name}
                        onChange={update("name")}
                        autoFocus
                      />
                      <L label="Venue" v={form.venue} onChange={update("venue")} />
                      <L label="City" v={form.city} onChange={update("city")} />
                      <L
                        label="Start (ISO e.g. 2025-09-20T18:00:00+02:00)"
                        v={form.start}
                        onChange={update("start")}
                      />
                      <L label="End (ISO)" v={form.end} onChange={update("end")} />
                      <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                        <L
                          label="Latitude (optional)"
                          v={form.lat}
                          onChange={update("lat")}
                        />
                        <L
                          label="Longitude (optional)"
                          v={form.lng}
                          onChange={update("lng")}
                        />
                      </div>
                    </div>
                  </Section>
                )}

                {step === 2 && (
                  <Section
                    title="Details & vibe"
                    icon={<Music4 className="h-4 w-4 text-amber-300" />}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Select
                        label="Event type / category"
                        v={form.category}
                        onChange={update("category")}
                        options={[
                          "",
                          "Club",
                          "Outdoor",
                          "Lounge",
                          "Beach",
                          "Festival",
                          "VIP Lounge",
                        ]}
                      />
                      <L
                        label="Dress code (optional)"
                        v={form.dressCode}
                        onChange={update("dressCode")}
                      />
                      <L
                        label="Min ticket price (R)"
                        v={form.priceMin}
                        onChange={update("priceMin")}
                      />
                      <L
                        label="Max ticket price (R)"
                        v={form.priceMax}
                        onChange={update("priceMax")}
                      />
                      <L
                        label="Ticket link (optional)"
                        v={form.ticketLink}
                        onChange={update("ticketLink")}
                      />
                      <Check
                        label="Early bird tickets available"
                        v={form.earlyBird}
                        onChange={update("earlyBird")}
                      />
                      <L
                        label="Age restriction (e.g. 18)"
                        v={form.age}
                        onChange={update("age")}
                      />
                      <L
                        label="Capacity (approx)"
                        v={form.capacity}
                        onChange={update("capacity")}
                      />

                      {/* NEW: Risk label + notes */}
                      <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                        <Select
                          label={
                            <span className="inline-flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4 text-amber-300" />
                              Risk label (pilot)
                            </span>
                          }
                          v={form.riskLabel}
                          onChange={update("riskLabel")}
                          options={["", "Low", "Medium", "High"]}
                        />
                        <T
                          label="Risk notes (why)"
                          v={form.riskNotes}
                          onChange={update("riskNotes")}
                          rows={2}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <T
                          label="Safety notes (parking, entry, etc.)"
                          v={form.safetyNotes}
                          onChange={update("safetyNotes")}
                          rows={2}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <T
                          label="Short description"
                          v={form.description}
                          onChange={update("description")}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      <L
                        label="Activities (comma-separated)"
                        v={form.activities}
                        onChange={update("activities")}
                      />
                      <L
                        label="Menu (comma-separated)"
                        v={form.menu}
                        onChange={update("menu")}
                      />
                      <div className="sm:col-span-2">
                        <L
                          label="Line-up / artists (comma-separated)"
                          v={form.lineup}
                          onChange={update("lineup")}
                        />
                      </div>
                    </div>
                  </Section>
                )}

                {step === 3 && (
                  <Section
                    title="Media & organizer"
                    icon={<Img className="h-4 w-4 text-amber-300" />}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <L
                        label="Poster image URL (optional)"
                        v={form.posterImage}
                        onChange={update("posterImage")}
                      />
                      <div className="text-sm">
                        <span className="text-slate-300">Or upload poster</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onPosterChange}
                          className="mt-1 block w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-slate-100"
                        />
                      </div>
                      <L
                        label="Promo video link (YouTube/TikTok, optional)"
                        v={form.promoVideo}
                        onChange={update("promoVideo")}
                      />
                      <L
                        label="Music / vibe preview URL (Spotify/MP3)"
                        v={form.vibeUrl}
                        onChange={update("vibeUrl")}
                      />
                      <L
                        label="Organizer / crew"
                        v={form.organizer}
                        onChange={update("organizer")}
                      />
                      <L
                        label="Contact (email / IG)"
                        v={form.contact}
                        onChange={update("contact")}
                      />
                    </div>
                  </Section>
                )}

                {error && <div className="text-red-300 text-sm">{error}</div>}

                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={back}>
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={next}>
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="inline-flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" /> Publish event
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDone?.()}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT: Live Preview */}
              <div className="lg:sticky lg:top-6">
                <PreviewCard {...preview} />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 🎉 Confetti overlay */}
      {celebrate && <Celebrate pieces={200} />}
    </div>
  );
}

/* ---------- helpers / small subcomponents ---------- */

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}

function L({ label, v, onChange, autoFocus }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        value={v}
        onChange={onChange}
        autoFocus={autoFocus}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300 text-slate-100 placeholder-slate-400"
        placeholder=""
      />
    </label>
  );
}

function T({ label, v, onChange, rows = 3 }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <textarea
        value={v}
        onChange={onChange}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300 text-slate-100 placeholder-slate-400 resize-y"
      />
    </label>
  );
}

function Check({ label, v, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={!!v}
        onChange={onChange}
        className="h-4 w-4 rounded border-white/20 bg-black/30"
      />
      {label}
    </label>
  );
}

function Select({ label, v, onChange, options = [] }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <select
        value={v}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300 text-slate-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "Select…"}
          </option>
        ))}
      </select>
    </label>
  );
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ---------- Live preview card (compact) ---------- */

function buildPreview(f) {
  const when =
    required(f.start) && required(f.end)
      ? `${new Date(f.start).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })} – ${new Date(f.end).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })}`
      : "Pick start & end time";

  const price =
    f.priceMin || f.priceMax
      ? `From R${f.priceMin || f.priceMax}${
          f.priceMax ? ` • Up to R${f.priceMax}` : ""
        }${f.earlyBird ? " • Early bird" : ""}`
      : f.earlyBird
      ? "Early bird available"
      : "—";

  const poster = f.posterImage || "/bg-party.jpg";

  return {
    name: f.name || "Your event name",
    venue: f.venue || "Venue name",
    city: f.city || "City",
    when,
    activities: split(f.activities),
    lineup: split(f.lineup),
    category: f.category,
    dressCode: f.dressCode,
    price,
    safety: f.safetyNotes,
    riskLabel: f.riskLabel, // preview risk tag
    poster,
  };
}

function PreviewCard({
  name,
  venue,
  city,
  when,
  activities = [],
  lineup = [],
  category,
  dressCode,
  price,
  safety,
  riskLabel,
  poster,
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/0 shadow">
      <div
        className="relative h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${poster})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
        <div className="absolute left-4 bottom-3 right-4">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold truncate">{name}</div>
            {riskLabel && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  riskLabel === "High"
                    ? "bg-red-500/20 border-red-400/40"
                    : riskLabel === "Medium"
                    ? "bg-amber-400/20 border-amber-300/40"
                    : "bg-emerald-500/20 border-emerald-400/40"
                }`}
                title="Risk label (pilot)"
              >
                {riskLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-300 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {venue} • {city}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-xs text-slate-300">{when}</div>
        {category && <Chip>{category}</Chip>}
        {dressCode && <Chip>Dress: {dressCode}</Chip>}
        <div className="text-xs text-slate-200">
          <span className="text-slate-400">Price:</span> {price}
        </div>
        {!!activities.length && <Row label="Activities" items={activities} />}
        {!!lineup.length && <Row label="Line-up" items={lineup} />}
        {safety && (
          <div className="text-xs text-slate-300">
            <span className="text-slate-400">Safety:</span> {safety}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, items }) {
  return (
    <div className="text-xs">
      <span className="text-slate-400">{label}:</span>{" "}
      <span className="text-slate-200">{items.join(" • ")}</span>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/8 border border-white/10 mr-1">
      {children}
    </span>
  );
}

/* ---------- tiny visual stepper ---------- */

function Stepper({ step }) {
  return (
    <div className="mt-2 flex gap-2">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-8 rounded-full ${
            step >= i ? "bg-white/70" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}
