import React from "react";
import { follow, unfollow, isFollowing } from "../lib/follows";


export default function ArtistFollowButton({ id, size = "sm" }) {
const [on, setOn] = React.useState(() => isFollowing(id));
React.useEffect(() => {
const h = () => setOn(isFollowing(id));
window.addEventListener("gg:followed-artists-changed", h);
return () => window.removeEventListener("gg:followed-artists-changed", h);
}, [id]);
const cls = size === "sm" ? "text-xs px-3 py-1.5" : "px-4 py-2";
return (
<button
className={`btn-bounce rounded-xl border border-white/15 ${on ? "bg-white text-black" : "hover:bg-white/10"} ${cls}`}
onClick={() => (on ? unfollow(id) : follow(id))}
>
{on ? "Following" : "Follow"}
</button>
);
}