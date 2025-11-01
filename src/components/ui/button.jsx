import React from "react";

export function Button({
  className = "",
  variant = "default",   // "default" | "outline" | "ghost" | "glass" | "chip" | "pill"
  size = "md",           // "sm" | "md" | "lg"
  active = false,        // used by chip/pill to show selection
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl transition-all " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0 " +
    "disabled:opacity-60 disabled:pointer-events-none font-medium";

  const variants = {
    default:
      "bg-black text-white hover:scale-[1.02] active:scale-[0.98]",
    outline:
      "border border-white/20 bg-white text-gray-900 hover:bg-white/90",
    ghost:
      "bg-transparent text-slate-100 hover:bg-white/5",
    glass:
      "bg-white/10 text-white border border-white/15 backdrop-blur " +
      "hover:bg-white/14 hover:border-white/25 active:bg-white/8 shadow-sm",

    // used by the category filter bar
    chip:
      (active
        ? "bg-white/12 text-white border border-white/25 shadow-sm " +
          "ring-2 ring-amber-400/70 ring-offset-0 " +
          "shadow-[inset_0_0_0_1px_rgba(255,193,7,0.45)]"
        : "bg-transparent text-slate-200 border border-white/12 hover:bg-white/6") +
      " backdrop-blur",

    // large glossy “action pill” for Uber + prev/next
    pill:
      (active
        ? "bg-white/12 text-white border border-white/25 " +
          "ring-2 ring-amber-400/70 shadow-[inset_0_0_0_1px_rgba(255,193,7,0.45)]"
        : "bg-white/10 text-white border border-white/15 hover:bg-white/14 hover:border-white/25") +
      " rounded-full backdrop-blur shadow-sm",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-[15px]",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      data-active={active ? "true" : "false"}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
