// src/components/RatingStars.jsx
import React from "react";

export default function RatingStars({ value = 0, onChange, size = "md" }) {
  const [hover, setHover] = React.useState(0);
  const s = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const pad = size === "sm" ? "gap-1" : "gap-1.5";

  const Star = ({ i }) => {
    const filled = (hover || value) >= i;
    return (
      <button
        type="button"
        aria-label={`${i} star`}
        onMouseEnter={() => setHover(i)}
        onMouseLeave={() => setHover(0)}
        onClick={() => onChange?.(i)}
        className="focus:outline-none"
      >
        <svg
          className={`${s} ${filled ? "fill-yellow-400" : "fill-transparent"} stroke-yellow-400`}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 17.27l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z"
            strokeWidth="1.2"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className={`inline-flex ${pad}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} i={i} />
      ))}
    </div>
  );
}
