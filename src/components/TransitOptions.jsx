// src/components/TransitOptions.jsx
import React, { useMemo } from "react";
import { Car, CarFront, Bus, Footprints } from "lucide-react";
import { Button } from "./ui/button";

function seededRand(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}
function mins(event, base) {
  const r = seededRand(event.id + event.city + "time");
  return Math.round(base * (0.8 + r * 0.6));
}
function cost(event, base) {
  const r = seededRand(event.id + event.city + "cost");
  return Math.round(base * (0.8 + r * 0.6));
}

export default function TransitOptions({ event }) {
  const q = encodeURIComponent(`${event.venue}, ${event.city}`);

  const bolt = useMemo(
    () => ({ eta: mins(event, 14), price: cost(event, 85) }),
    [event]
  );
  const taxi = useMemo(
    () => ({ eta: mins(event, 16), price: cost(event, 95) }),
    [event]
  );
  const minibus = useMemo(
    () => ({ eta: mins(event, 25), price: cost(event, 25) }),
    [event]
  );

  const Item = ({ icon: Icon, label, value, href }) => (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover-glow">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 opacity-90" />
        <div className="font-semibold">{label}</div>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span>~{value.eta} min</span>
        <span className="text-slate-500">•</span>
        <span>{value.price ? `R${value.price}` : "—"}</span>
        <Button
          size="sm"
          variant="outline"
          className="glow-button btn-bounce"
          onClick={() => window.open(href, "_blank")}
        >
          Open
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <Item
        icon={Car}
        label="Uber (estimate)"
        value={{ eta: mins(event, 12), price: cost(event, 90) }}
        href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${q}`}
      />
      <Item icon={CarFront} label="Bolt" value={bolt} href="https://bolt.eu/" />
      <Item
        icon={Bus}
        label="Minibus / MyCiTi"
        value={minibus}
        href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
      />
      <Item
        icon={Footprints}
        label="Drive / Park"
        value={{ eta: mins(event, 18), price: 0 }}
        href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
      />
    </div>
  );
}
