// src/components/ArtistDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import ArtistGigForm from "./ArtistGigForm";
import ArtistInbox from "./ArtistInbox";
import {
  loadGigs,
  saveGig,
  deleteGig,
  loadFollowers,
  seedFollowers,
  loadViews,
  bumpViews,
} from "../lib/artist";

import {
  Users2,
  Eye,
  Calendar,
  Music4,
  Inbox,
  Settings,
  Plus,
  MapPin,
  Trash2,
  Edit,
  ExternalLink,
  Ticket,
  Share2,
  Check,
  X,
} from "lucide-react";

/* ----------------------------------------------------------------------------
   Local helpers for "Events to attend" (accepted invitations)
---------------------------------------------------------------------------- */
const attendKey = (artistId) => `artist:${artistId}:attend`;

function loadAttend(artistId) {
  try {
    return JSON.parse(localStorage.getItem(attendKey(artistId)) || "[]");
  } catch {
    return [];
  }
}
function saveAttend(artistId, list) {
  localStorage.setItem(attendKey(artistId), JSON.stringify(list));
}

/* ----------------------------------------------------------------------------
   GlowCard: subtle spotlight following the cursor (no heavy libs)
---------------------------------------------------------------------------- */
function GlowCard({ className = "", children }) {
  const [bg, setBg] = React.useState("");
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        setBg(
          `radial-gradient(240px 200px at ${x}px ${y}px, rgba(255,214,10,.16), transparent 60%)`
        );
      }}
      onMouseLeave={() => setBg("")}
      className={
        "relative overflow-hidden transition-all duration-300 " +
        "hover:border-yellow-300/30 hover:shadow-[0_0_0_1px_rgba(255,214,10,.25),0_0_48px_rgba(255,214,10,.15)] " +
        className
      }
      style={{
        backgroundImage: bg || undefined,
        backgroundBlendMode: bg ? "screen" : undefined,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[.06] bg-[radial-gradient(60%_80%_at_30%_20%,#ffd60a,transparent)]" />
      {children}
    </div>
  );
}

/**
 * Full-page glassy Artist Dashboard
 * - Left: artist card + stats + quick actions
 * - Right: tabs (Overview, Performances, Messages, Audience, Settings)
 * - Accept/Decline dummy organizer invite → accepted goes to "Events to attend"
 *
 * Props:
 *  - artistId, artistName, onClose, allEvents
 */
export default function ArtistDashboard({
  artistId = "demo-artist",
  artistName = "Your Artist Name",
  onClose,
  allEvents = [],
}) {
  // seed demo followers & fake views
  useEffect(() => seedFollowers(artistId), [artistId]);
  useEffect(() => bumpViews(artistId, 2), [artistId]); // simulate traffic

  const followers = loadFollowers(artistId);
  const views = loadViews(artistId);

  const [refresh, setRefresh] = useState(0);
  const gigsAll = useMemo(() => loadGigs(artistId), [artistId, refresh]);

  const now = Date.now();
  const gigs = useMemo(() => {
    const upcoming = gigsAll
      .filter((g) => new Date(g.start).getTime() >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    const past = gigsAll
      .filter((g) => new Date(g.start).getTime() < now)
      .sort((a, b) => new Date(b.start) - new Date(a.start));
    return { upcoming, past };
  }, [gigsAll]);

  // "Events to attend" (accepted invitations)
  const [attend, setAttend] = useState(() => loadAttend(artistId));
  useEffect(() => saveAttend(artistId, attend), [artistId, attend]);

  // Dummy invitation (you can replace with real inbox data later)
  const [invite, setInvite] = useState(() => ({
    id: "invite-001",
    organizer: "Sunset Sessions",
    title: "Sunset Sessions • Beach Club",
    venue: "Beach Club",
    city: "Cape Town",
    start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // +7 days
    end: null,
    notes:
      "We’d love you to play a 90-minute House set. Drinks & transport covered.",
    ticketUrl: "",
    posterUrl: "",
  }));

  const acceptInvite = () => {
    if (!invite) return;
    // 1) add to "Events to attend"
    const newItem = { ...invite, id: `attend-${Date.now()}` };
    setAttend((prev) => [newItem, ...prev]);
    // 2) optional: also add to upcoming gigs (comment out if not desired)
    saveGig(artistId, {
      id: `gig-${Date.now()}`,
      title: invite.title,
      venue: invite.venue,
      city: invite.city,
      start: invite.start,
      end: invite.end,
      notes: "Accepted invitation",
      ticketUrl: invite.ticketUrl,
      posterUrl: invite.posterUrl,
    });
    setRefresh((x) => x + 1);
    // 3) clear the invite
    setInvite(null);
  };

  const declineInvite = () => setInvite(null);

  const [tab, setTab] = useState("overview");
  const tabs = [
    { key: "overview", label: "Overview", icon: Music4 },
    { key: "performances", label: "Performances", icon: Calendar },
    { key: "messages", label: "Messages", icon: Inbox },
    { key: "audience", label: "Audience", icon: Users2 },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  // Glass helpers
  const wrap = "max-w-6xl mx-auto px-4";
  const card =
    "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg";
  const pill =
    "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs";

  return (
    <div className="min-h-screen relative text-slate-100">
      {/* Wallpaper (served from /public) */}
      <div
        className="absolute inset-0 -z-10 bg-center bg-cover"
        style={{ backgroundImage: "url('/ArtistWallpaper.jpg')" }}
        aria-hidden
      />
      {/* Dark veil for legibility */}
      <div
        className="absolute inset-0 -z-10 bg-black/65 backdrop-blur-[2px]"
        aria-hidden
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className={`${wrap} py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-xs inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
            >
              ← Back
            </button>
            <div>
              <div className="font-extrabold text-lg">
                {artistName} — Artist Dashboard
              </div>
              <div className="text-xs text-slate-300">
                Manage performances, messages & audience
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className={pill}>
              <Users2 className="h-4 w-4" /> {followers.length} followers
            </div>
            <div className={pill}>
              <Eye className="h-4 w-4" /> {views} profile views
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className={`${wrap} py-6 grid lg:grid-cols-[280px_1fr] gap-6`}>
        {/* Sidebar */}
        <aside className="space-y-4">
          <GlowCard className={`${card} p-5`}>
            <div className="flex items-center gap-3">
              <img
                src={`https://i.pravatar.cc/72?u=${artistId}`}
                alt=""
                className="h-12 w-12 rounded-2xl object-cover"
              />
              <div>
                <div className="font-semibold">{artistName}</div>
                <div className="text-xs text-slate-300">Verified Artist</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <Stat label="Followers" value={followers.length} />
              <Stat label="Views" value={views} />
              <Stat label="Upcoming" value={gigs.upcoming.length} />
            </div>
          </GlowCard>

          {/* Quick actions */}
          <GlowCard className={`${card} p-4`}>
            <div className="font-semibold mb-3">Quick actions</div>
            <div className="space-y-2">
              <button
                onClick={() => setTab("performances")}
                className="w-full text-left px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Post new performance
              </button>
              <button
                onClick={() => setTab("messages")}
                className="w-full text-left px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 inline-flex items-center gap-2"
              >
                <Inbox className="h-4 w-4" />
                Check organizer messages
              </button>
            </div>
          </GlowCard>

          {/* Tabs (mobile) */}
          <div className="lg:hidden">
            <TabStrip tab={tab} setTab={setTab} tabs={tabs} />
          </div>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {/* Tabs (desktop) */}
          <div className="hidden lg:block">
            <TabStrip tab={tab} setTab={setTab} tabs={tabs} />
          </div>

          {tab === "overview" && (
            <div className="grid xl:grid-cols-2 gap-6">
              {/* Dummy message / invite */}
              {invite && (
                <GlowCard className={`${card} p-5 xl:col-span-2`}>
                  <h3 className="font-semibold mb-2">New message</h3>
                  <div className="text-sm text-slate-200">
                    <b>{invite.organizer}</b>: {invite.notes}
                  </div>
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="font-medium">{invite.title}</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {invite.venue} • {invite.city} —{" "}
                      {new Date(invite.start).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={acceptInvite}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-400/20 px-3 py-1.5 text-emerald-100 hover:bg-emerald-400/25"
                    >
                      <Check className="h-4 w-4" />
                      Accept offer
                    </button>
                    <button
                      onClick={declineInvite}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-300/40 bg-red-400/15 px-3 py-1.5 text-red-100 hover:bg-red-400/20"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  </div>
                </GlowCard>
              )}

              <GlowCard className={`${card} p-5`}>
                <h3 className="font-semibold mb-3">Next up</h3>
                {gigs.upcoming.length ? (
                  <ul className="space-y-3">
                    {gigs.upcoming.slice(0, 5).map((g) => (
                      <GigItem key={g.id} gig={g} />
                    ))}
                  </ul>
                ) : (
                  <Empty text="No upcoming performances yet." />
                )}
              </GlowCard>

              <GlowCard className={`${card} p-5`}>
                <h3 className="font-semibold mb-3">Recent messages</h3>
                <div className="text-sm text-slate-300">
                  Open the <b>Messages</b> tab to read and reply to organizers.
                </div>
              </GlowCard>

              {/* Events to attend (accepted invites) */}
              <GlowCard className={`${card} p-5 xl:col-span-2`}>
                <h3 className="font-semibold mb-3">Events to attend</h3>
                {attend.length ? (
                  <ul className="space-y-3">
                    {attend.map((g) => (
                      <GigItem key={g.id} gig={g} />
                    ))}
                  </ul>
                ) : (
                  <Empty text="No accepted invitations yet." />
                )}
              </GlowCard>

              <GlowCard className={`${card} p-5 xl:col-span-2`}>
                <h3 className="font-semibold mb-3">Recent past gigs</h3>
                {gigs.past.length ? (
                  <ul className="space-y-3">
                    {gigs.past.slice(0, 6).map((g) => (
                      <GigItem key={g.id} gig={g} past />
                    ))}
                  </ul>
                ) : (
                  <Empty text="No past performances logged yet." />
                )}
              </GlowCard>
            </div>
          )}

          {tab === "performances" && (
            <div className="space-y-6">
              {/* Inline form panel */}
              <GlowCard className={`${card} p-5`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Post a new performance</h3>
                </div>
                <div className="mt-3">
                  <ArtistGigForm
                    artistId={artistId}
                    onSaved={() => setRefresh((x) => x + 1)}
                  />
                </div>
              </GlowCard>

              {/* Upcoming & Past lists */}
              <div className="grid xl:grid-cols-2 gap-6">
                <GlowCard className={`${card} p-5`}>
                  <h3 className="font-semibold mb-3">Upcoming</h3>
                  {gigs.upcoming.length ? (
                    <ul className="space-y-3">
                      {gigs.upcoming.map((g) => (
                        <GigItem
                          key={g.id}
                          gig={g}
                          onDelete={() => {
                            deleteGig(artistId, g.id);
                            setRefresh((x) => x + 1);
                          }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <Empty text="No upcoming performances yet." />
                  )}
                </GlowCard>

                <GlowCard className={`${card} p-5`}>
                  <h3 className="font-semibold mb-3">Past</h3>
                  {gigs.past.length ? (
                    <ul className="space-y-3">
                      {gigs.past.map((g) => (
                        <GigItem key={g.id} gig={g} past />
                      ))}
                    </ul>
                  ) : (
                    <Empty text="No past performances logged." />
                  )}
                </GlowCard>
              </div>
            </div>
          )}

          {tab === "messages" && (
            <GlowCard className={`${card} p-5`}>
              <ArtistInbox artistId={artistId} />
            </GlowCard>
          )}

          {tab === "audience" && (
            <GlowCard className={`${card} p-5`}>
              <h3 className="font-semibold mb-3">Followers</h3>
              <AudienceGrid followers={followers} />
            </GlowCard>
          )}

          {tab === "settings" && (
            <GlowCard className={`${card} p-5 space-y-4`}>
              <h3 className="font-semibold">Settings</h3>
              <div className="text-sm text-slate-300">
                This MVP stores data in your browser. When you’re ready, we’ll
                swap to Firebase collections:
                <code className="mx-1">artists/&lt;id&gt;/gigs</code>,
                <code className="mx-1">artists/&lt;id&gt;/messages</code>.
              </div>
              <div className="text-sm text-slate-300">
                Need custom slots, team managers, or payouts? We’ll add them
                here.
              </div>
            </GlowCard>
          )}
        </section>
      </div>

      <footer className="py-10 text-center text-sm text-slate-400">
        Artist tools • v0.2
      </footer>
    </div>
  );
}

/* ---------- Small components ---------- */

function TabStrip({ tab, setTab, tabs }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const ActiveIcon = t.icon;
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "text-xs inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 backdrop-blur " +
              (active
                ? "border-yellow-300/40 bg-yellow-300/20"
                : "border-white/15 bg-white/5 hover:bg-white/10")
            }
          >
            <ActiveIcon className="h-4 w-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-slate-300">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function AudienceGrid({ followers }) {
  if (!followers?.length)
    return <Empty text="No followers yet — share your profile link." />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
      {followers.map((f) => (
        <div
          key={f.id}
          className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col items-center text-center"
        >
          <img
            src={f.avatar}
            alt=""
            className="h-12 w-12 rounded-full mb-2 object-cover"
          />
          <div className="text-xs">{f.name}</div>
        </div>
      ))}
    </div>
  );
}

function GigItem({ gig, past = false, onDelete }) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">{gig.title}</div>
        <div className="flex items-center gap-2">
          {!past && onDelete && (
            <button
              onClick={onDelete}
              className="text-xs inline-flex items-center gap-1 rounded-lg border border-white/20 px-2 py-1 hover:bg-white/10"
              title="Remove"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-300 mt-1">
        {new Date(gig.start).toLocaleString()}{" "}
        {gig.end
          ? `– ${new Date(gig.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : ""}
      </div>
      <div className="text-sm mt-1">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {gig.venue} • {gig.city}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {gig.ticketUrl && (
          <a
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 text-black"
            href={gig.ticketUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Ticket className="h-3 w-3" />
            Tickets
          </a>
        )}
        {gig.posterUrl && (
          <a
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20"
            href={gig.posterUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-3 w-3" />
            Poster
          </a>
        )}
        <button
          onClick={() =>
            navigator.clipboard?.writeText(
              `${gig.title} • ${gig.venue}, ${gig.city} — ${new Date(
                gig.start
              ).toLocaleString()}`
            )
          }
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20"
        >
          <Share2 className="h-3 w-3" />
          Copy blurb
        </button>
        {gig.slotName && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/20">
            <Edit className="h-3 w-3" />
            Slot: {gig.slotName}
          </span>
        )}
      </div>
      {gig.notes && (
        <div className="mt-2 text-sm text-slate-200/90">{gig.notes}</div>
      )}
    </li>
  );
}

function Empty({ text }) {
  return <div className="text-sm text-slate-400">{text}</div>;
}
