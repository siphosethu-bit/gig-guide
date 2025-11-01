// src/components/HowItWorks.jsx
import React from "react";
import { X, Bell, MapPin, BadgePercent, Shield, Users, Ticket, LineChart } from "lucide-react";

export default function HowItWorks({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur grid place-items-center px-4">
      <div className="relative w-[min(980px,100%)] rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full border border-white/15 bg-white/10 p-2 hover:bg-white/20"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          How it works
        </h2>
        <p className="text-slate-300 mb-6">
          SA Gig Guide helps you discover events, plan the night with friends, and arrive safely.
        </p>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card icon={<Ticket className="h-5 w-5" />} title="Swipe posters">
            Browse curated gigs by genre, city, budget and popularity. Save favorites for later.
          </Card>

          <Card icon={<MapPin className="h-5 w-5" />} title="Area preview + rides">
            See the venue on the map and get Uber price estimates to and from the event.
          </Card>

          <Card icon={<Bell className="h-5 w-5" />} title="One-tap reminders">
            Set reminders for ticket drops or event start times—get a toast + browser notification.
          </Card>

          <Card icon={<Users className="h-5 w-5" />} title="Plan with friends">
            Share a plan link with per-person ride split estimates for your crew.
          </Card>

          <Card icon={<Shield className="h-5 w-5" />} title="Safety & transit">
            Quick safety notes and public transport options right next to the event.
          </Card>

          <Card icon={<BadgePercent className="h-5 w-5" />} title="Budget filter">
            Slide your max budget to instantly hide pricey events.
          </Card>

          <Card icon={<LineChart className="h-5 w-5" />} title="Organizer tools">
            Verified organizers can post gigs and view analytics (tickets, engagement, reach).
          </Card>

          <Card icon={<Users className="h-5 w-5" />} title="Artists">
            Browse artists, follow them, and filter listings by creators you follow.
          </Card>
        </div>

        <div className="mt-6 text-xs text-slate-400">
          Tip: You can open this again anytime from the welcome screen or help.
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="text-amber-300">{icon}</div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="text-sm text-slate-300">{children}</p>
    </div>
  );
}
