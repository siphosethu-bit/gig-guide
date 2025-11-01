// src/lib/ticketkit.js
export function makeCreditId() {
  // e.g., J157-96YX
  const a = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(2, 6);
  return `${a().slice(0,4)}-${a().slice(0,4)}`;
}

export function makeTicketMessage({ event, totals, details, creditId }) {
  const credit = Number(details.credit) || 0;
  const uber = Number(details.uber) || 0;
  const when = new Date(event.start).toLocaleString();
  return [
    `*Ticket Confirmed* — ${event.name}`,
    `👤 ${details.first} ${details.last}`,
    `📍 ${event.venue} • ${event.city}`,
    `🗓️ ${when}`,
    credit ? `🍹 Club credit: R${credit} (ID: ${creditId})` : null,
    uber ? `🚗 Uber (round trip) added: R${uber}` : null,
    `💰 Total paid: R${totals.toLocaleString()}`,
    ``,
    `Show this message (and your *Credit ID*) at the door/bar. Enjoy!`,
  ].filter(Boolean).join("\n");
}
