// src/components/OrganizerDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import EventForm from "./EventForm";
import AnalyticsDashboard from "./AnalyticsDashboard";
import {
  X,
  Plus,
  BarChart2,
  Users,
  RefreshCw,
  Mail,
  MapPin,
  Star,
  Edit3,
  Share2,
} from "lucide-react";
 import { Button } from "./ui/button";

// Public image fallbacks (files placed in /public)
const SAMPLE_IMAGES = ["/1.jpeg", "/2.jpeg", "/3.jpeg", "/4.jpeg", "/5.jpeg"];
const FALLBACK_AVATAR = SAMPLE_IMAGES[0];
const FALLBACK_EVENT_IMAGE = SAMPLE_IMAGES[2];

// ---- Local storage helpers ----
function getUserEvents() {
  try {
    const raw = localStorage.getItem("gg_user_events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function setUserEvents(list) {
  try {
    localStorage.setItem("gg_user_events", JSON.stringify(list));
  } catch {}
}
function getInvites() {
  try {
    const raw = localStorage.getItem("gg_collab_invites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function setInvites(list) {
  try {
    localStorage.setItem("gg_collab_invites", JSON.stringify(list));
  } catch {}
}

// ---- Mock organizer directory ----
const MOCK_ORGANIZERS = [
  {
    id: "org-aurora",
    name: "Aurora Nights",
    city: "Cape Town",
    rating: 4.7,
    genres: ["House", "Amapiano", "Afro"],
    artists: ["DJ Maphorisa", "DBN Gogo", "Sun-El Musician"],
    pastEvents: [
      { id: "e1", name: "Beach Sunset Jam 2025", city: "Clifton", attendees: 1800 },
      { id: "e2", name: "Neon Rooftop", city: "CBD", attendees: 900 },
    ],
    bio: "Boutique experiences, scenic venues, and tight artist curation.",
    avatar: SAMPLE_IMAGES[1] || FALLBACK_AVATAR,
  },
  {
    id: "org-vibe",
    name: "Vibe Foundry",
    city: "Johannesburg",
    rating: 4.5,
    genres: ["Hip-hop", "Afrobeats", "Dance"],
    artists: ["Cassper Nyovest", "Kamo Mphela", "Focalistic"],
    pastEvents: [
      { id: "e3", name: "District Block Party", city: "Braamfontein", attendees: 2200 },
      { id: "e4", name: "Bassline Live", city: "Newtown", attendees: 1400 },
    ],
    bio: "High-energy city nights with strong brand partners.",
    avatar: SAMPLE_IMAGES[2] || FALLBACK_AVATAR,
  },
  {
    id: "org-lucid",
    name: "Lucid Collective",
    city: "Durban",
    rating: 4.6,
    genres: ["Deep House", "Tribal", "Electronic"],
    artists: ["Black Coffee", "Das Kapital", "Caiiro"],
    pastEvents: [
      { id: "e5", name: "Shoreline Sessions", city: "Umhlanga", attendees: 1700 },
      { id: "e6", name: "Afterglow", city: "Morningside", attendees: 800 },
    ],
    bio: "Polished, premium, and meticulously produced.",
    avatar: SAMPLE_IMAGES[3] || FALLBACK_AVATAR,
  },
];

export default function OrganizerDashboard({ onClose, allEvents = [], onChanged }) {
  const [tab, setTab] = useState("mine"); // 'mine' | 'post' | 'analytics' | 'collaborate'
  const [mine, setMine] = useState(() => getUserEvents());
  const [refreshTick, setRefreshTick] = useState(0);

  // Analytics modal
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Collaborate UI
  const [profileOpen, setProfileOpen] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(null); // stores org.id when open
  const [inviteMsg, setInviteMsg] = useState("");
  const [sent, setSent] = useState(() => getInvites());

  // Seed one event for first-time organizers (with a solid image fallback)
  useEffect(() => {
    const seeded = localStorage.getItem("gg_seeded_org_event");
    if (!seeded && mine.length === 0 && allEvents.length) {
      const now = Date.now();
      const upcoming = [...allEvents]
        .filter((e) => new Date(e.start).getTime() > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      const sample = upcoming[0] || allEvents[0];

      const draft = {
        ...sample,
        id: sample.id || "org-seeded-" + Date.now(),
        organizerOwned: true,
        status: "Live",
        image: sample.image || sample.poster || FALLBACK_EVENT_IMAGE,
      };
      const next = [draft];
      setUserEvents(next);
      setMine(next);
      localStorage.setItem("gg_seeded_org_event", "1");
    }
  }, [allEvents, mine.length]);

  // recompute my events on refresh
  useEffect(() => {
    setMine(getUserEvents());
  }, [refreshTick]);

  const Background = () => (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px] scale-105"
      >
        {/* file in /public/video */}
        <source src="/video/2022395-hd_1920_1080_30fps (1).mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/90" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-[60vh] w-[60vh] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[60vh] w-[60vh] rounded-full bg-fuchsia-500/10 blur-3xl" />
    </>
  );

  function handleRefresh() {
    setRefreshTick((t) => t + 1);
    if (typeof onChanged === "function") onChanged();
  }

  function handleInviteSend(orgId) {
    const org = MOCK_ORGANIZERS.find((o) => o.id === orgId);
    if (!org) return;
    const next = [
      ...sent,
      {
        id: "inv_" + Date.now(),
        to: orgId,
        toName: org.name,
        message: inviteMsg || "Hi! Keen to collaborate on our next gig?",
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    ];
    setSent(next);
    setInvites(next);
    setInviteMsg("");
    setInviteOpen(null);
  }

  // ====== UI blocks ======
  function MyEvents() {
    if (!mine.length) {
      return (
        <div className="card-dark p-4 text-sm text-slate-300">
          You haven’t posted any events yet. Switch to{" "}
          <button className="underline text-white" onClick={() => setTab("post")}>
            Post new
          </button>{" "}
          to add one.
        </div>
      );
    }
    return (
      <div className="grid xl:grid-cols-2 gap-6">
        {mine.map((e) => (
          <div
            key={e.id}
            className="rounded-2xl overflow-hidden border border-white/15 bg-white/10 shadow-xl"
          >
            {/* Organizer styled header */}
            <div className="h-44 relative">
              <img
                src={e.image || e.poster || FALLBACK_EVENT_IMAGE}
                alt={e.name}
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{e.name}</div>
                    <div className="text-xs text-slate-200 flex items-center gap-2 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {e.venue} • {e.city}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md text-xs bg-emerald-400/90 text-black font-semibold">
                    {e.status || "Live"}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="text-xs text-slate-300">
                {new Date(e.start).toLocaleString()} —{" "}
                {new Date(e.end || e.start).toLocaleString()}
              </div>
              {e.activities?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.activities.map((a, i) => (
                    <span key={i} className="badge-chip">
                      {a}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Admin actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
                >
                  <Edit3 className="h-4 w-4" /> Edit details
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
                  onClick={() => setAnalyticsOpen(true)}
                >
                  <BarChart2 className="h-4 w-4" /> View analytics
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
                  onClick={() => {
                    navigator.clipboard?.writeText(location.href);
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share poster
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function PostNew() {
    return (
      <div className="card-dark p-4">
        <EventForm
          onDone={() => {
            handleRefresh();
            setTab("mine");
          }}
        />
      </div>
    );
  }

  function Analytics() {
    return (
      <div className="card-dark p-4">
        <div className="text-sm text-slate-300 mb-3">
          View poster performance, CTR, hourly sales, SharePay clicks, and more.
        </div>
        <Button
          variant="glass"
          size="sm"
          className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
          onClick={() => setAnalyticsOpen(true)}
        >
          <BarChart2 className="h-4 w-4" /> Open poster analytics
        </Button>
      </div>
    );
  }

  function Collaborate() {
    // Existing “Collaborate” button keeps the prominent yellow-active state.
    const collabBtnBase =
      "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm " +
      "border bg-white/10 border-white/20 text-slate-100 " +
      "backdrop-blur hover:bg-white/20 transition-shadow";
    const collabBtnActive =
      "ring-2 ring-yellow-400/70 border-yellow-300/70 " +
      "shadow-[0_0_0_3px_rgba(0,0,0,0.2),0_0_30px_rgba(251,191,36,0.18)]";

    return (
      <>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
          {MOCK_ORGANIZERS.map((org) => {
            const isActive = inviteOpen === org.id;
            return (
              <div key={org.id} className="relative">
                {/* Gradient frame */}
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/25 via-white/10 to-transparent pointer-events-none" />
                <div className="relative card-dark p-4 h-full">
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    <img
                      src={org.avatar || FALLBACK_AVATAR}
                      alt={org.name}
                      className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold truncate">{org.name}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">
                          Organizer
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {org.city}
                        <span className="inline-flex items-center gap-1 ml-2">
                          <Star className="h-3.5 w-3.5" /> {org.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="mt-3">
                    <div className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">
                      Genres
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {org.genres.map((g) => (
                        <span key={g} className="badge-chip">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Artists */}
                  <div className="mt-3">
                    <div className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">
                      Artists hosted
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {org.artists.map((a) => (
                        <span key={a} className="badge-chip">
                          @{a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent events */}
                  <div className="mt-3">
                    <div className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">
                      Recent events
                    </div>
                    <ul className="text-sm list-disc list-inside text-slate-300 space-y-1">
                      {org.pastEvents.map((p) => (
                        <li key={p.id}>
                          {p.name} • {p.city} • {p.attendees} ppl
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
                      onClick={() => setProfileOpen(org.id)}
                    >
                      View profile
                    </Button>
                    <button
                      className={`${collabBtnBase} ${isActive ? collabBtnActive : ""}`}
                      onClick={() => setInviteOpen(org.id)}
                      title="Collaborate"
                    >
                      <Mail className="h-4 w-4" /> Collaborate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sent.length ? (
          <div className="card-dark p-4 mt-5">
            <div className="font-semibold mb-2">Sent collaboration invites</div>
            <ul className="text-sm space-y-2">
              {sent.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-slate-200 truncate">
                      To <span className="font-medium">{inv.toName}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {new Date(inv.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-300 text-sm mt-1">
                      “{inv.message}”
                    </div>
                  </div>
                  <span className="badge-chip shrink-0">sent</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }

  // Glassy tab buttons with yellow active state
  const tabBtnBase =
    "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm " +
    "border bg-white/10 border-white/20 text-slate-100 " +
    "backdrop-blur hover:bg-white/20 transition-shadow";
  const tabBtnActive =
    "ring-2 ring-yellow-400/70 border-yellow-300/70 " +
    "shadow-[0_0_0_3px_rgba(0,0,0,0.2),0_0_30px_rgba(251,191,36,0.18)]";

  const content = useMemo(() => {
    switch (tab) {
      case "mine":
        return <MyEvents />;
      case "post":
        return <PostNew />;
      case "analytics":
        return <Analytics />;
      case "collaborate":
        return <Collaborate />;
      default:
        return <MyEvents />;
    }
  }, [tab, mine, sent, inviteOpen]);

  return (
    <div className="fixed inset-0 z-[70]">
      <Background />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold tracking-tight">
              Organizer Dashboard
            </div>
            <div className="text-xs text-slate-300">
              Manage your gigs, collaborate, and track performance.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-white/15 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-2"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              className="rounded-lg border border-white/15 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" /> Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button
            className={`${tabBtnBase} ${tab === "mine" ? tabBtnActive : ""}`}
            onClick={() => setTab("mine")}
            title="My events"
          >
            My events
          </button>
          <button
            className={`${tabBtnBase} ${tab === "post" ? tabBtnActive : ""}`}
            onClick={() => setTab("post")}
            title="Post new"
          >
            <Plus className="h-4 w-4" /> Post new
          </button>
          <button
            className={`${tabBtnBase} ${tab === "analytics" ? tabBtnActive : ""}`}
            onClick={() => setTab("analytics")}
            title="Analytics"
          >
            <BarChart2 className="h-4 w-4" /> Analytics
          </button>
          <button
            className={`${tabBtnBase} ${tab === "collaborate" ? tabBtnActive : ""}`}
            onClick={() => setTab("collaborate")}
            title="Collaborate"
          >
            <Users className="h-4 w-4" /> Collaborate
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">{content}</div>
      </div>

      {/* Profile modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="card-dark max-w-2xl w-full">
            {(() => {
              const org = MOCK_ORGANIZERS.find((o) => o.id === profileOpen);
              if (!org) return null;
              return (
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={org.avatar || FALLBACK_AVATAR}
                      alt={org.name}
                      className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/20"
                    />
                    <div className="flex-1">
                      <div className="text-xl font-semibold">{org.name}</div>
                      <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> {org.city}
                        <span className="inline-flex items-center gap-1 ml-2">
                          <Star className="h-3.5 w-3.5" /> {org.rating}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 mt-3">{org.bio}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Genres</div>
                      <div className="flex flex-wrap gap-2">
                        {org.genres.map((g) => (
                          <span key={g} className="badge-chip">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Artists hosted</div>
                      <div className="flex flex-wrap gap-2">
                        {org.artists.map((a) => (
                          <span key={a} className="badge-chip">
                            @{a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-slate-400 mb-1">Recent events</div>
                    <ul className="text-sm list-disc list-inside text-slate-300">
                      {org.pastEvents.map((p) => (
                        <li key={p.id}>
                          {p.name} • {p.city} • {p.attendees} ppl
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
                      onClick={() => setProfileOpen(null)}
                    >
                      Close
                    </Button>
                    <Button
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90"
                      onClick={() => {
                        setProfileOpen(null);
                        setInviteOpen(org.id);
                      }}
                    >
                      <Mail className="h-4 w-4" /> Invite to collaborate
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="card-dark max-w-lg w-full p-4">
            {(() => {
              const org = MOCK_ORGANIZERS.find((o) => o.id === inviteOpen);
              if (!org) return null;
              return (
                <>
                  <div className="font-semibold">
                    Invite {org.name} to collaborate
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Share a quick intro and the event you have in mind.
                  </div>
                  <textarea
                    className="mt-3 w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
                    rows={4}
                    placeholder="Hey Aurora Nights — we’re planning a beachfront Amapiano night on Oct 28 in Clifton. Would love to co-host and split promo. Thoughts?"
                    value={inviteMsg}
                    onChange={(e) => setInviteMsg(e.target.value)}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="cursor-target hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]"
                      onClick={() => setInviteOpen(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90"
                      onClick={() => handleInviteSend(org.id)}
                    >
                      Send invite
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Analytics modal */}
      {analyticsOpen && (
        <AnalyticsDashboard
          events={allEvents}
          onClose={() => setAnalyticsOpen(false)}
        />
      )}
    </div>
  );
}

/* This file now uses the shared <Button /> glass variant so your actions read clearly as buttons
   and show a yellow “selector” glow on hover/focus. */
