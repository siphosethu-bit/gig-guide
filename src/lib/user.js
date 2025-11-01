// src/lib/user.js
const KEY = "gg_user";

const DEFAULT_USER = {
  id: "me",
  name: "You",
  avatar:
    "https://i.pravatar.cc/120?img=3" // feel free to change to a selfie url
};

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function setUser(updates) {
  const cur = getUser();
  const nxt = { ...cur, ...updates };
  try {
    localStorage.setItem(KEY, JSON.stringify(nxt));
  } catch {}
  window.dispatchEvent(new CustomEvent("gg:user-changed", { detail: nxt }));
  return nxt;
}
