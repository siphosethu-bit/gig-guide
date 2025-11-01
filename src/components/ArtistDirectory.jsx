import React from "react";
import { X } from "lucide-react";
import { listArtists } from "../lib/artistIndex";
import ArtistCard from "./ArtistCard";


export default function ArtistDirectory({ open, onClose, onOpenProfile }) {
if (!open) return null;
const [q, setQ] = React.useState("");
const all = listArtists();
const filtered = all.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));
return (
<div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur overflow-auto">
<div className="max-w-4xl mx-auto p-6">
<div className="card-dark p-4 sticky top-4 z-10 flex items-center justify-between">
<div className="font-extrabold tracking-tight">Artists</div>
<button className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10" onClick={onClose}><X className="h-4 w-4"/></button>
</div>


<div className="mt-4 card-dark p-4">
<input
value={q}
onChange={e=>setQ(e.target.value)}
placeholder="Search South African artists…"
className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 outline-none"
/>
</div>


<div className="grid sm:grid-cols-2 gap-4 mt-4">
{filtered.map(a => (
<ArtistCard key={a.id} a={a} onOpen={onOpenProfile} />
))}
</div>
</div>
</div>
);
}