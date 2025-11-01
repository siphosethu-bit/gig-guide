// src/lib/storage.js
export const favKey = "gg:favourites";

export function getFaves() {
  try {
    return new Set(JSON.parse(localStorage.getItem(favKey) || "[]"));
  } catch {
    return new Set();
  }
}
export function setFaves(set) {
  localStorage.setItem(favKey, JSON.stringify([...set]));
}
