import React from "react";
import { Button } from "./ui/button";

export default function FilterPill({ label, icon: Icon, pressed, onClick }) {
  return (
    <Button
      variant="chip"
      size="sm"
      active={pressed}
      className="rounded-full px-4"
      onClick={onClick}
      aria-pressed={pressed}
      title={label}
    >
      {Icon ? <Icon className="h-4 w-4 mr-1.5" /> : null}
      {label}
    </Button>
  );
}
