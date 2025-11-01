// src/components/UberButtons.jsx
import React from "react";
import { Button } from "./ui/button";
import { Car } from "lucide-react";

export default function UberButtons({
  onGoNow,
  onAfterParty,
  estimateGoNow,
  estimateAfter,
  isToday = false, // pass true if the event is today
}) {
  // Extra CSS classes for today's event
  const todayPulse = isToday ? "btn-uber-today" : "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="pill"
        size="lg"
        className={`gap-2 glow-button btn-bounce ${todayPulse}`}
        onClick={onGoNow}
        aria-label="Get Uber now"
      >
        <Car className="w-4 h-4 opacity-90" />
        <span>Get Uber (Go Now)</span>
        {estimateGoNow ? (
          <span className="ml-2 text-slate-200/90 text-[13px]">
            {estimateGoNow}
          </span>
        ) : null}
      </Button>

      <Button
        variant="pill"
        size="lg"
        className={`gap-2 glow-button btn-bounce ${todayPulse}`}
        onClick={onAfterParty}
        aria-label="Get Uber after party"
      >
        <Car className="w-4 h-4 opacity-90" />
        <span>Get Uber (After Party)</span>
        {estimateAfter ? (
          <span className="ml-2 text-slate-200/90 text-[13px]">
            {estimateAfter}
          </span>
        ) : null}
      </Button>
    </div>
  );
}
