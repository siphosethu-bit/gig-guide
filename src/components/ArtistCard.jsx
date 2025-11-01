// src/components/ArtistCard.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react";
import ArtistFollowButton from "./ArtistFollowButton";

export default function ArtistCard({ a, onOpen }) {
  return (
    <div className="card-dark p-4 flex items-center gap-4">
      <img
        src={a.avatar}
        alt=""
        className="h-14 w-14 rounded-xl object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center gap-1 font-semibold leading-tight">
          {a.name}
          {a.verified && (
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
          )}
        </div>
        <div className="text-xs text-slate-300">
          {a.genre?.join(" • ")}
        </div>
        <div className="mt-2 flex gap-2">
          <ArtistFollowButton id={a.id} />
          <button
            className="text-xs rounded-xl border border-white/15 px-3 py-1.5 hover:bg-white/10"
            onClick={() => onOpen(a.id)}
          >
            View profile
          </button>
        </div>
      </div>
    </div>
  );
}
