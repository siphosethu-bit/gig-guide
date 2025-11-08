// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";

// data
import eventsData from "./data/events.json";

// core UI
import FilterBar from "./components/FilterBar";
import BigMap from "./components/BigMap";
import { MapPin, Calendar as CalIcon, Home as HomeIcon } from "lucide-react";

// panels / extras (now consolidated inside ActionDock)
import TicketModal from "./components/TicketModal";
import EventModal from "./components/EventModal";
import ActionDock from "./components/ActionDock";
import MyEventsModal from "./components/MyEventsModal";

// role & posting
import RoleGate from "./components/RoleGate";
import EventForm from "./components/EventForm";
import { getUserEvents } from "./lib/userEvents";

// organizer dashboard (full-page)
import OrganizerDashboard from "./components/OrganizerDashboard";

// chat + toasts
import ChatWidget from "./components/ChatWidget";
import Toaster from "./components/Toaster";
import { findDue, markFired } from "./lib/reminders";

// popularity
import { topNByPopularity } from "./lib/popularity";

// group planning
import { decodePlan } from "./lib/planKit";

// artists
import ArtistDirectory from "./components/ArtistDirectory";
import ArtistProfile from "./components/ArtistProfile";
import { getFollowed } from "./lib/follows";
import { resolveEventArtistIds } from "./lib/artistIndex";

// user profile bits
import UserButton from "./components/UserButton";
import UserProfile from "./components/UserProfile";

// auth pane + firebase
import AuthPane from "./components/AuthPane";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// background + effects
import LiveBackground from "./components/LiveBackground";

// calendar + welcome flows
import CalendarModal from "./components/CalendarModal";
import WelcomeIntro from "./components/WelcomeIntro";
import HowItWorks from "./components/HowItWorks";

// 🔹 Artist dashboard
import ArtistDashboard from "./components/ArtistDashboard";

// ----------------------------------------------------

function GlamBackground({ img = "/bg-party.jpg" }) {
  return (
    <div className="app-bg fixed inset-0 -z-40">
      <div
        className="absolute inset-0 bg-center bg-cover opacity-30"
        style={{ backgroundImage: `url(${img})` }}
        aria-hidden
      />
      <div className="aurora" aria-hidden />
      <div className="grid-overlay" aria-hidden />
      <div className="vignette" aria-hidden />
    </div>
  );
}

export default function App() {
  // --- Welcome flow ---
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      if (typeof window === "undefined") return true;
      return !window.localStorage.getItem("gg_seen_welcome");
    } catch {
      return true;
    }
  });
  useEffect(() => {
    if (showWelcome) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [showWelcome]);

  // RoleGate visibility
  const [roleGateOpen, setRoleGateOpen] = useState(true);

  // Auth + role
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) return setRole("");
      try {
        const snap = await getDoc(doc(db, "userRoles", u.uid));
        setRole(snap.exists() ? snap.data().role || "" : "");
      } catch {
        setRole("");
      }
    });
    return unsub;
  }, []);

  // How it works modal
  const [howOpen, setHowOpen] = useState(false);

  function handleStart({ openRoleGate } = {}) {
    setShowWelcome(false);
    try {
      window.localStorage.setItem("gg_seen_welcome", "1");
    } catch {}
    if (openRoleGate) setAuthOpen(false);
    setRoleGateOpen(true);
  }

  function goHome() {
    setShowWelcome(true);
    setRoleGateOpen(true);
    try {
      window.localStorage.removeItem("gg_seen_welcome");
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Organizer dashboard: full-page
  const [showOrganizer, setShowOrganizer] = useState(false);

  // 🔹 Artist dashboard: overlay
  const [showArtist, setShowArtist] = useState(false);

  // Event data + state
  const [refreshKey, setRefreshKey] = useState(0);
  const mergedEvents = useMemo(() => {
    const userEvents = getUserEvents();
    const merged = [...eventsData, ...userEvents];

    // Hide events that ended > 14 days ago
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const fresh = merged.filter((e) => {
      const end = new Date(e.end || e.start).getTime();
      return end >= twoWeeksAgo;
    });

    return fresh.sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [refreshKey]);

  const [active, setActive] = useState(mergedEvents[0] || eventsData[0]);

  // Modal for pin → event
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalData, setEventModalData] = useState(null);

  // City selector (lives in BigMap)
  const [cityKey, setCityKey] = useState("ALL");

  // Filters
  const [category, setCategory] = useState("All");
  const [showFaves, setShowFaves] = useState(false);
  const faves = getFaves();
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [budgetMax, setBudgetMax] = useState(150);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [sort, setSort] = useState("soonest");

  // Trending
  const trendingIds = useMemo(() => {
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const soonest = mergedEvents
      .filter(
        (e) =>
          new Date(e.start).getTime() > now &&
          new Date(e.start).getTime() - now <= threeDays
      )
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5)
      .map((e) => e.id);
    const popular = topNByPopularity(mergedEvents, 5);
    return new Set([...soonest, ...popular]);
  }, [mergedEvents]);

  // Filtered list for map + panels
  const filtered = useMemo(() => {
    let list = mergedEvents;

    // City filter (rough match)
    if (cityKey !== "ALL") {
      const cityName =
        cityKey === "JHB"
          ? /johannesburg|soweto|sandton|fourways|randburg/i
          : cityKey === "PTA"
          ? /pretoria|tshwane/i
          : cityKey === "CPT"
          ? /cape town|seapoint|camp?s bay|milnerton|woodstock/i
          : cityKey === "DBN"
          ? /durban|umhlanga|umlazi/i
          : cityKey === "PLZ"
          ? /gqeberha|port elizabeth/i
          : cityKey === "BLO"
          ? /bloemfontein/i
          : cityKey === "PLK"
          ? /polokwane/i
          : null;
      if (cityName) {
        list = list.filter((e) => cityName.test(`${e.city} ${e.venue}`));
      }
    }

    // Category filter
    if (category !== "All") {
      list = list.filter(
        (e) =>
          (e.category && e.category === category) ||
          (e.activities || []).some((a) => new RegExp(category, "i").test(a)) ||
          (category === "Club" &&
            /club|nightclub|konka|taboo|origin|tiger|zone 6/i.test(`${e.venue}`)) ||
          (category === "Lounge" && /lounge|cocktail/i.test(`${e.venue}`)) ||
          (category === "Outdoor" &&
            /outdoor|stage/i.test(`${(e.activities || []).join(" ")}`)) ||
          (category === "Beach" &&
            /beach|grand beach|shimmy/i.test(`${e.venue} ${e.city}`))
      );
    }

    // Favourites
    if (showFaves) list = list.filter((e) => faves.has(e.id));

    // Budget
    if (budgetEnabled) {
      list = list.filter((e) => {
        const price = typeof e.price === "number" ? e.price : 1e9;
        return price <= budgetMax;
      });
    }

    // Following
    if (followingOnly) {
      const followed = getFollowed();
      list = list.filter((e) =>
        resolveEventArtistIds(e).some((id) => followed.has(id))
      );
    }

    // Sorting
    if (sort === "price-asc") {
      list = [...list].sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === "popular") {
      list = [...list].sort(
        (a, b) => (trendingIds.has(b.id) ? 1 : 0) - (trendingIds.has(a.id) ? 1 : 0)
      );
    } else {
      list = [...list].sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    return list.length ? list : mergedEvents;
  }, [
    mergedEvents,
    cityKey,
    category,
    showFaves,
    faves,
    budgetEnabled,
    budgetMax,
    followingOnly,
    sort,
    trendingIds,
  ]);

  // Title + active validity
  useEffect(() => {
    document.title = active ? `${active.name} • SA Gig Guide` : "SA Gig Guide";
  }, [active]);
  useEffect(() => {
    if (filtered.length && !filtered.find((e) => e.id === active?.id)) {
      setActive(filtered[0]);
    }
  }, [filtered]);

  // Ticket + calendar + analytics modals
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [calOpen, setCalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Artists + profile
  const [artistDirOpen, setArtistDirOpen] = useState(false);
  const [artistProfileId, setArtistProfileId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // My Events modal
  const [myEventsOpen, setMyEventsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (title, body) =>
    setToasts((t) => [...t, { id: Date.now() + Math.random(), title, body }]);
  const closeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // Publish + organizer change
  function onEventPublished() {
    setRefreshKey((k) => k + 1);
  }
  function onOrganizerChanged() {
    setRefreshKey((k) => k + 1);
  }

  // Ticket events bus
  useEffect(() => {
    function onOpen(e) {
      setTicketEvent(e.detail.event);
      setTicketOpen(true);
    }
    function onPrice(e) {
      setTicketPrice(e.detail.price);
    }
    window.addEventListener("gg:open-ticket", onOpen);
    window.addEventListener("gg:set-ticket-price", onPrice);
    return () => {
      window.removeEventListener("gg:open-ticket", onOpen);
      window.removeEventListener("gg:set-ticket-price", onPrice);
    };
  }, []);

  // Focus from anywhere
  useEffect(() => {
    const onFocus = (e) => {
      const id = e.detail?.id;
      if (!id) return;
      const match = mergedEvents.find((x) => x.id === id);
      if (match) setActive(match);
      window.scrollTo({ top: 120, behavior: "smooth" });
    };
    window.addEventListener("gg:focus-event", onFocus);
    return () => window.removeEventListener("gg:focus-event", onFocus);
  }, [mergedEvents]);

  // Deep-link plan
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("plan");
    if (!code) return;
    try {
      const plan = decodePlan(code);
      if (!plan) return;
      const target = mergedEvents.find((e) => e.id === plan.eventId);
      if (target) setActive(target);
      pushToast(
        "Group plan received",
        `Ride split ~R${plan.perPerson}/person for ${plan.eventName}.`
      );
    } catch {}
  }, [mergedEvents]);

  // Reminder engine (still runs to deliver any existing reminders via toast)
  useEffect(() => {
    const tick = () => {
      const due = findDue(new Date());
      if (!due.length) return;
      for (const r of due) {
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            const n = new Notification("Event reminder", {
              body: `${r.title} is starting soon.`,
            });
            setTimeout(() => n.close(), 5000);
          } catch {}
        }
        pushToast("Event reminder", `${r.title} is starting soon.`);
        markFired(r.id);
      }
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  // Artist open hook
  useEffect(() => {
    const h = (e) => setArtistProfileId(e.detail?.id || null);
    window.addEventListener("gg:open-artist", h);
    return () => window.removeEventListener("gg:open-artist", h);
  }, []);

  // ========= FULL-PAGE ORGANIZER DASHBOARD (unchanged) =========
  if (showOrganizer) {
    return (
      <div className="min-h-screen bg-black text-slate-100">
        <OrganizerDashboard
          onClose={() => setShowOrganizer(false)}
          allEvents={mergedEvents}
          onChanged={onOrganizerChanged}
        />
      </div>
    );
  }
  // =================================================

  // Reusable class for glass+glow nav buttons
  const navBtn =
    "text-xs inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md " +
    "transition-all hover:bg-white/10 hover:shadow-[0_0_0_2px_rgba(255,200,0,.35)] focus:outline-none " +
    "focus:shadow-[0_0_0_2px_rgba(255,200,0,.5)]";

  return (
    <div className="min-h-screen relative text-slate-100">
      {showWelcome && (
        <WelcomeIntro
          onStart={handleStart}
          onHowItWorks={() => setHowOpen(true)}
        />
      )}
      <HowItWorks open={howOpen} onClose={() => setHowOpen(false)} />

      {/* Auth modal */}
      <AuthPane
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthChange={(u, r) => {
          setUser(u);
          setRole(r || "");
        }}
      />

      <GlamBackground img="/bg-party.jpg" />
      <LiveBackground className="fixed inset-0 -z-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-white text-black flex items-center justify-center font-extrabold">
              GG
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-lg">SA Gig Guide</div>
              <div className="text-xs text-slate-300">Explore events • Swipe posters</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className={navBtn} onClick={goHome} title="Home">
              <HomeIcon className="h-4 w-4" /> Home
            </button>

            <button className={navBtn} onClick={() => setCalOpen(true)} title="Calendar">
              <CalIcon className="h-4 w-4" /> Calendar
            </button>

            <button className={navBtn} onClick={() => setMyEventsOpen(true)} title="My Events">
              My Events
            </button>

            <button className={navBtn} onClick={() => setArtistDirOpen(true)} title="Artists">
              Artists
            </button>

            {/* 🔹 Artist Portal shortcut for artist role */}
            {role === "artist" && (
              <button
                className={navBtn}
                onClick={() => setShowArtist(true)}
                title="Artist portal"
              >
                Artist Portal
              </button>
            )}

            {user ? (
              <button
                className={navBtn}
                onClick={() => {
                  signOut(auth);
                  try {
                    window.localStorage.removeItem("gg_seen_welcome");
                  } catch {}
                  setShowWelcome(true);
                  setRoleGateOpen(true);
                  setAuthOpen(false);
                  setUser(null);
                  setRole("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title={user.email}
              >
                Sign out
              </button>
            ) : (
              <button className={navBtn} onClick={() => setAuthOpen(true)}>
                Sign in
              </button>
            )}

            <div className="hidden sm:block text-slate-300 ml-2">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" /> South Africa
              </span>
            </div>

            <div className="ml-3">
              <UserButton onOpen={() => setProfileOpen(true)} />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20">
          <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-slate-300 whitespace-nowrap overflow-x-auto no-scrollbar">
            Kanye West — Rocking the Daisies • Burna Boy — FNB Stadium Live • Tems — Afropunk Joburg •
            Tiwa Savage — Cape Town Jazz Festival • Doja Cat — DStv Delicious
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* 🔹 Tagline with Amsterdam font — ONLY this line */}
        <div className="mb-6 text-center">
          <p
            className="amsterdam-font text-2xl md:text-3xl tracking-wide"
            style={{ fontFamily: "Amsterdam One, cursive" }}
          >
            Book the vibe. Plan the night. Arrive together
          </p>
        </div>

        {/* 🔥 BIG MAP ON TOP */}
        <div className="mb-6">
          <BigMap
            cityKey={cityKey}
            onCityChange={setCityKey}
            events={filtered}
            onPick={(e) => {
              setActive(e);
              setEventModalData(e);
              setEventModalOpen(true);
            }}
          />
        </div>

        {/* Sleek control bar */}
        <div className="mb-8">
          <FilterBar
            category={category}
            setCategory={setCategory}
            budgetEnabled={budgetEnabled}
            setBudgetEnabled={setBudgetEnabled}
            budgetMax={budgetMax}
            setBudgetMax={setBudgetMax}
            followingOnly={followingOnly}
            setFollowingOnly={setFollowingOnly}
            sort={sort}
            setSort={setSort}
            totalCount={filtered.length}
          />
        </div>

        {/* Two-column layout: left helper + right ActionDock */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-300">
              Tap any pin on the map to preview the event in a quick glass pop-up.  
              Use the console on the right to plan rides, buy tickets, and check safety.
            </div>
          </section>

          <aside className="space-y-4">
            {active && (
              <div className="flex items-center gap-2 text-slate-200">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Venue:</span>
                <span>{active.venue} • {active.city}</span>
              </div>
            )}
            <ActionDock event={active} />
            <div className="text-xs text-slate-400">Tip: use arrow keys or drag to switch events.</div>
          </aside>
        </div>
      </main>

      <footer className="py-10 text-center text-sm text-slate-400">
        Built with React, TailwindCSS, Framer Motion, and Google Maps. Shipped as MVP.
      </footer>

      {/* 🔹 Center glass modal for event details (pin → modal) */}
      <EventModal
        open={eventModalOpen}
        event={eventModalData || active}
        onClose={() => setEventModalOpen(false)}
        onBuy={(ev) => {
          setEventModalOpen(false);
          setTicketEvent(ev);
          setTicketOpen(true);
        }}
      />

      {/* Tickets modal */}
      <TicketModal
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        event={ticketEvent || active}
        ticketPrice={ticketPrice || 120}
      />

      {/* Role gate appears after welcome is dismissed */}
      {!user && roleGateOpen && !showWelcome && (
        <RoleGate
          onPick={(mode) => {
            setRoleGateOpen(false);
            if (mode === "post") setShowOrganizer(true);
            if (mode === "artist") setShowArtist(true);
          }}
        />
      )}

      {/* Optional: old inline poster form */}
      {/* <EventForm onDone={onEventPublished} /> */}

      {calOpen && (
        <CalendarModal
          open={calOpen}
          onClose={() => setCalOpen(false)}
          events={mergedEvents}
          onPick={(e) => {
            setActive(e);
            window.scrollTo({ top: 120, behavior: "smooth" });
          }}
        />
      )}

      {/* Artists & profile */}
      <ArtistDirectory
        open={artistDirOpen}
        onClose={() => setArtistDirOpen(false)}
        onOpenProfile={(id) => {
          setArtistDirOpen(false);
          setArtistProfileId(id);
        }}
      />
      <ArtistProfile
        open={!!artistProfileId}
        onClose={() => setArtistProfileId(null)}
        artistId={artistProfileId}
        events={mergedEvents}
      />
      <UserProfile
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        events={mergedEvents}
      />

      <MyEventsModal open={myEventsOpen} onClose={() => setMyEventsOpen(false)} />

      {/* 🔹 NEW: Artist dashboard as a full-screen overlay (no unmounts) */}
      {showArtist && (
        <div className="fixed inset-0 z-[70] bg-black text-slate-100">
          <ArtistDashboard
            artistId={user?.uid || "demo-artist"}
            artistName={user?.displayName || "Your Artist Name"}
            allEvents={mergedEvents}
            onClose={() => {
              setShowArtist(false);      // hide dashboard
              setShowWelcome(true);      // show WelcomeIntro
              setRoleGateOpen(false);    // don’t pop RoleGate over the welcome page
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      <ChatWidget />
      <Toaster items={toasts} onClose={closeToast} />
    </div>
  );
}

// local helpers
function getFaves() {
  try {
    const raw = window.localStorage.getItem("gg_faves");
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}
