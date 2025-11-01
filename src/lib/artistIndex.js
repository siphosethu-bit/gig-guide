import artists from "../data/artists.json";


const NAME_TO_ID = new Map(
artists.map(a => [a.name.toLowerCase(), a.id])
);


export function listArtists() { return artists; }


export function byId(id) {
return artists.find(a => a.id === id);
}


export function resolveEventArtistIds(event) {
// Preferred: event.artistIds (explicit)
if (Array.isArray(event.artistIds) && event.artistIds.length) return event.artistIds;


// Fallbacks: check event.performers or activities text for known names
const hay = [
...(event.performers || []),
...(event.activities || []),
event.name,
event.venue,
].join(" • ").toLowerCase();


const ids = [];
for (const a of artists) {
if (hay.includes(a.name.toLowerCase())) ids.push(a.id);
}
return [...new Set(ids)];
}