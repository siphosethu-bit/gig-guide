// src/components/MusicPreview.jsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Music2 } from "lucide-react";

function inferEmbed(url) {
  if (!url) return null;
  if (url.includes("spotify.com/track"))
    return url.replace("/track/", "/embed/track/");
  if (url.includes("open.spotify.com/playlist"))
    return url.replace("/playlist/", "/embed/playlist/");
  if (url.includes("youtube.com/watch?v=")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${id}`;
  }
  return null;
}

export default function MusicPreview({ url }) {
  const [open, setOpen] = useState(false);
  const embed = inferEmbed(url);
  if (!embed) return null;

  return (
    <div className="space-y-3">
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        <Music2 className="h-5 w-5 mr-2" />
        {open ? "Hide vibe preview" : "Preview vibe"}
      </Button>
      {open && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
          <iframe
            title="music-preview"
            src={embed}
            width="100%"
            height="160"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
