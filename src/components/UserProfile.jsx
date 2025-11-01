// src/components/UserProfile.jsx
import React from "react";
import { X, CheckCircle2, Mail, Phone, User as UserIcon } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

import { getUser } from "../lib/user"; // avatar fallback
import { getRatings, setRating, removeRating } from "../lib/ratings";
import { getFollowed } from "../lib/follows";
import { byId as artistById } from "../lib/artistIndex";
import RatingStars from "./RatingStars";
import EventCard from "./EventCard";
import ArtistCard from "./ArtistCard";

// 🆕 Recommendation rail
import RecommendedRail from "./RecommendedRail";

export default function UserProfile({ open, onClose, events }) {
  if (!open) return null;

  const localUser = getUser();

  const [identity, setIdentity] = React.useState({
    loading: true,
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });

  const [ratings, setRatingsState] = React.useState(getRatings());

  React.useEffect(() => {
    const h = () => setRatingsState(getRatings());
    window.addEventListener("gg:ratings-changed", h);
    return () => window.removeEventListener("gg:ratings-changed", h);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setIdentity({
          loading: false,
          name: "Guest",
          email: "",
          phone: "",
          photoURL: "",
        });
        return;
      }
      let name = u.displayName || "";
      let phone = "";
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data();
          name = name || d?.name || "";
          phone = d?.phone || "";
        }
      } catch {
        // ignore read errors
      }
      setIdentity({
        loading: false,
        name: name || "User",
        email: u.email || "",
        phone,
        photoURL: u.photoURL || "",
      });
    });
    return () => unsub();
  }, [open]);

  const followedIds = [...getFollowed()];
  const followedArtists = followedIds.map(artistById).filter(Boolean);

  const pastRated = Object.entries(ratings)
    .map(([id, r]) => {
      const e = events.find((x) => String(x.id) === String(id));
      return e ? { event: e, rating: r } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.rating.ts - a.rating.ts);

  const avatarSrc =
    identity.photoURL || localUser?.avatar || "/avatar-placeholder.png";

  return (
    <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card-dark p-5 flex items-center gap-4">
          <img
            src={avatarSrc}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover border border-white/15"
          />
          <div className="flex-1">
            <div className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              {identity.name || "User"}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                Member
              </span>
            </div>
            <div className="text-xs text-slate-300">Your gig identity</div>
          </div>

          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile (read-only) */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Profile</div>
          </div>

          {identity.loading ? (
            <div className="text-sm text-slate-300 mt-3">Loading…</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Full name
                </label>
                <div className="mt-1 text-white/90">{identity.name || "—"}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </label>
                <div className="mt-1 text-white/90">{identity.email || "—"}</div>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </label>
                <div className="mt-1 text-white/90">{identity.phone || "—"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Artists you follow */}
        <section className="card-dark p-5">
          <div className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-400" /> Artists you follow
          </div>
          {followedArtists.length ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {followedArtists.map((a) => (
                <ArtistCard
                  key={a.id}
                  a={a}
                  onOpen={() =>
                    window.dispatchEvent(
                      new CustomEvent("gg:open-artist", { detail: { id: a.id } })
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              You aren’t following anyone yet. Open <b>Artists</b> from the
              header and tap Follow.
            </div>
          )}
        </section>

        {/* Events you rated */}
        <section className="card-dark p-5">
          <div className="font-semibold mb-3">Events you rated</div>
          {pastRated.length ? (
            <div className="space-y-4">
              {pastRated.map(({ event, rating }) => (
                <div
                  key={event.id}
                  className="border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="p-3">
                    <EventCard event={event} compact />
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RatingStars
                        value={rating.stars}
                        onChange={(v) => setRating(event.id, v, rating.note)}
                      />
                      <span className="text-xs text-slate-300">
                        {rating.stars ? `${rating.stars}/5` : "Not rated yet"}
                      </span>
                    </div>
                    <button
                      className="text-xs rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10"
                      onClick={() => removeRating(event.id)}
                    >
                      Remove rating
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              Rate any event you attended from its card (or add here once it
              appears).
            </div>
          )}
        </section>

        {/* 🆕 Recommendations */}
        <section className="card-dark p-5">
          <RecommendedRail events={events} />
        </section>
      </div>
    </div>
  );
}
