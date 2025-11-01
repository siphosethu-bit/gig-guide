// src/components/EventCard.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  MapPin,
  Clock4,
  UtensilsCrossed,
  Users2,
  Map,
  Flame,
  Ticket as TicketIcon,
  Star,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import Countdown from "./Countdown";
import FavoriteButton from "./FavoriteButton";
import ConfettiBurst from "./ConfettiBurst";
import MusicPreview from "./MusicPreview";
import { getFaves, setFaves } from "../lib/storage";
import { trackImpression, trackAction } from "../lib/analytics";

// ⭐ Ratings
import RatingStars from "./RatingStars";
import { setRating, getRatings } from "../lib/ratings";

/** Informational chip — subtle, transparent w/ white outline */
function Tag({ children }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] leading-tight font-medium " +
        "text-white/90 border border-white/30 bg-transparent " +
        "hover:bg-white/10 transition-colors duration-150 " +
        "mr-2 mb-2"
      }
    >
      {children}
    </span>
  );
}

/** Small kicker label for section headings */
function Kicker({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide text-[12px] uppercase">
      {Icon ? <Icon className="h-4 w-4 opacity-80" /> : null}
      {children}
    </div>
  );
}

export default function EventCard({ event, trending = false, compact = false }) {
  const [faves, setFavSet] = useState(getFaves());
  const [going, setGoing] = useState(false);

  // ratings state
  const ratings = getRatings();
  const myRating = ratings[event.id]?.stars || 0;

  useEffect(() => {
    if (event?.id) trackImpression(event.id);
  }, [event?.id]);

  const isFaved = faves.has(event.id);
  const toggleFav = () => {
    const copy = new Set(faves);
    if (copy.has(event.id)) copy.delete(event.id);
    else copy.add(event.id);
    setFavSet(copy);
    setFaves(copy);
    trackAction(event.id, "favorite");
  };

  const cover =
    event.image ||
    "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=1600&auto=format&fit=crop";
  const artists = event.lineup || [];
  const previewUrl =
    event.previewUrl || event.vibeUrl || event.music?.previewUrl;

  const dateLine = useMemo(() => {
    const s = new Date(event.start);
    const e = new Date(event.end);
    const fmt = (d) =>
      d
        .toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(",", "");
    return `${fmt(s)} – ${fmt(e)}`;
  }, [event.start, event.end]);

  const isToday =
    new Date(event.start).toDateString() === new Date().toDateString();

  // Social proof metrics (fake defaults if missing)
  const peopleGoing = event.peopleGoing ?? 2000; // 🔥 you can wire real data here
  const venueRating = event.rating ?? 4.7;
  const isTopRated = venueRating >= 4.6;

  // ===== COMPACT VARIANT =====
  if (compact) {
    const start = new Date(event.start);
    return (
      <Card className="card-dark p-3 hover-glow transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold leading-tight truncate">
                {event.name}
              </div>
              {trending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 text-black px-2 py-0.5 text-[10px] font-bold">
                  <Flame className="h-3 w-3" />
                  Trending
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-slate-300 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {event.venue} • {event.city}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <Clock4 className="h-3.5 w-3.5" />
              {start.toLocaleDateString()} •{" "}
              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <FavoriteButton isFaved={isFaved} onToggle={toggleFav} event={event} />
        </div>
      </Card>
    );
  }

  // ===== FULL CARD =====
  return (
    <Card
      className="card-dark overflow-hidden h-[560px] w-[92%] max-w-[780px] mx-auto hover-glow transition-shadow"
      style={{
        backgroundImage:
          "radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
      }}
    >
      <div className="relative">
        <ConfettiBurst fire={going} onDone={() => setGoing(false)} />
      </div>

      {/* HERO */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={cover}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl overflow-hidden ring-2 ring-white/20 flex-shrink-0">
            <img src={cover} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
                {event.name}
              </h2>
              {trending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 text-black px-2.5 py-0.5 text-xs font-bold shadow">
                  <Flame className="h-3.5 w-3.5" />
                  Trending
                </span>
              )}
            </div>

            {/* Venue + countdown */}
            <div className="mt-1 flex items-center gap-2 text-slate-200/90 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="truncate">
                {event.venue} • {event.city}
              </span>
              <Countdown start={event.start} end={event.end} />
            </div>

            {/* ⭐ Social proof badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="glass-badge inline-flex items-center gap-1.5">
                <Users2 className="h-4 w-4 opacity-90" />
                <span className="opacity-90">
                  {Intl.NumberFormat().format(peopleGoing)} going
                </span>
              </span>
              {isTopRated && (
                <span className="glass-badge inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-300" />
                  <span className="opacity-90">Top rated venue</span>
                </span>
              )}
            </div>
          </div>

          {/* Right column: Fave + Rating */}
          <div className="translate-y-1 flex flex-col items-end gap-2">
            <FavoriteButton isFaved={isFaved} onToggle={toggleFav} event={event} />
            <div className="rounded-xl bg-black/40 backdrop-blur px-3 py-1.5 border border-white/10 shadow-sm">
              <span className="sr-only">Your rating</span>
              <RatingStars
                value={myRating}
                size="sm"
                onChange={(v) => setRating(event.id, v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="glass-scroll p-4 sm:p-6 grid sm:grid-cols-2 gap-6 overflow-auto h-[calc(560px-12rem-64px)]">
        {/* Left column */}
        <div className="space-y-5">
          <div>
            <Kicker icon={Clock4}>When</Kicker>
            <div className="text-slate-100 mt-1">{dateLine}</div>
          </div>

          {!!(event.menu && event.menu.length) && (
            <div>
              <Kicker icon={UtensilsCrossed}>Menu</Kicker>
              <div className="mt-2 flex flex-wrap">
                {event.menu.map((t, i) => (
                  <Tag key={i}>{t}</Tag>
                ))}
              </div>
            </div>
          )}

          {!!artists.length && (
            <div>
              <Kicker icon={Users2}>Line-up</Kicker>
              <div className="mt-2 flex flex-wrap gap-2">
                {artists.map((a, i) => (
                  <Tag key={i}>{a.name || a}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {!!(event.activities && event.activities.length) && (
            <div>
              <Kicker>Activities</Kicker>
              <div className="mt-2 flex flex-wrap">
                {event.activities.map((t, i) => (
                  <Tag key={i}>{t}</Tag>
                ))}
              </div>
            </div>
          )}
          <MusicPreview url={previewUrl} />
        </div>
      </CardContent>

      {/* Divider */}
      <div className="mx-4 sm:mx-6 border-t border-white/10/50" />

      {/* FOOTER — primary actions with glow */}
      <CardFooter className="px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-3">
          <Button
            className="bg-white !text-black border border-white rounded-xl font-semibold glow-button"
            onClick={() => {
              trackAction(event.id, "map");
              window.open(
                event.mapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    event.venue + " " + event.city
                  )}`,
                "_blank"
              );
            }}
          >
            <Map className="h-5 w-7 mr-2" />
            Open in Google Maps
          </Button>

          <Button
            className={`bg-white !text-black border border-white rounded-xl font-semibold glow-button ${
              isToday ? "btn-uber-today" : ""
            } btn-bounce`}
            onClick={() => {
              setGoing(true);
              trackAction(event.id, "ticket");
              window.dispatchEvent(new CustomEvent("gg:open-ticket", { detail: { event } }));
              window.dispatchEvent(
                new CustomEvent("gg:set-ticket-price", { detail: { price: event.price || 120 } })
              );
            }}
          >
            <TicketIcon className="h-5 w-5 mr-2" />
            I’m Going 🎉
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
