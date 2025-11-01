export function getFollowed() {
try {
const raw = localStorage.getItem("gg_follow_artists");
return new Set(raw ? JSON.parse(raw) : []);
} catch {
return new Set();
}
}
export function isFollowing(id) {
return getFollowed().has(id);
}
export function follow(id) {
const s = getFollowed();
s.add(id);
try { localStorage.setItem("gg_follow_artists", JSON.stringify([...s])); } catch {}
window.dispatchEvent(new CustomEvent("gg:followed-artists-changed"));
}
export function unfollow(id) {
const s = getFollowed();
s.delete(id);
try { localStorage.setItem("gg_follow_artists", JSON.stringify([...s])); } catch {}
window.dispatchEvent(new CustomEvent("gg:followed-artists-changed"));
}