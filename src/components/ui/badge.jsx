import React from "react";

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-gray-800 ${className}`}>
      {children}
    </span>
  );
}
