// src/components/UserButton.jsx
import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Sparkles } from "lucide-react";

/** Build initials (fallback) */
function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "GG";
}

export default function UserButton({ onOpen }) {
  const [profile, setProfile] = React.useState({
    name: "You",
    email: "",
    phone: "",
    photoURL: "",
  });

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setProfile({ name: "Guest", email: "", phone: "", photoURL: "" });
        return;
      }
      // prefer displayName, then Firestore users doc.name
      let name = u.displayName || "";
      let phone = "";
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data();
          name = name || d?.name || "";
          phone = d?.phone || "";
        }
      } catch {}
      setProfile({
        name: name || "User",
        email: u.email || "",
        phone,
        photoURL: u.photoURL || "",
      });
      // broadcast to anything else that listens (optional)
      window.dispatchEvent(
        new CustomEvent("gg:user-changed", { detail: { ...u, name, phone } })
      );
    });
    return unsub;
  }, []);

  const avatar = profile.photoURL;

  return (
    <button
      onClick={onOpen}
      className="group flex flex-col items-center -mb-1"
      title={`${profile.name} • ${profile.email || ""}`}
      aria-label="Open profile"
    >
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="h-8 w-8 rounded-full ring-2 ring-white/15 group-hover:ring-white/30 object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full ring-2 ring-white/15 group-hover:ring-white/30 bg-white text-black grid place-items-center font-bold text-[11px]">
          {initials(profile.name)}
        </div>
      )}
      <span className="text-[11px] text-slate-300 mt-1 leading-none max-w-[92px] truncate">
        {profile.name}
      </span>
    </button>
  );
}
