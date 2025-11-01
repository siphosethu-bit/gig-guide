// src/components/BlurText.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "motion";

/**
 * Recursively explode a React node (string or JSX) into
 * <span data-word>WORD</span> nodes while preserving parent <span> classes
 * (so your colored words keep their colors).
 */
function explodeToWordSpans(node, inheritedClass = "") {
  // If it's just text, split into words
  if (typeof node === "string") {
    if (node === "") return [];
    const parts = node.split(/(\s+)/); // keep spaces
    return parts.map((part, i) => {
      const isSpace = /^\s+$/.test(part);
      return (
        <span
          key={`txt-${i}`}
          data-word={!isSpace ? "" : undefined}
          className={`inline-block will-change-transform will-change-filter ${inheritedClass}`}
          style={{ whiteSpace: "pre" }}
        >
          {part}
        </span>
      );
    });
  }

  // If it's not a valid element (null/boolean/etc.)
  if (!React.isValidElement(node)) return [];

  // Merge class names down so styled spans (e.g. pink/yellow/purple) are kept
  const mergedClass = [inheritedClass, node.props.className]
    .filter(Boolean)
    .join(" ")
    .trim();

  const kids = React.Children.toArray(node.props.children);
  return kids.flatMap((child) => explodeToWordSpans(child, mergedClass));
}

/**
 * BlurText
 * Props:
 *   - text: string | JSX (JSX can include colored <span>…</span> pieces)
 *   - delay: initial delay in ms
 *   - animateBy: "words" | "chars"  (chars only for string input)
 *   - direction: "top" | "bottom" | "left" | "right"
 *   - duration: per-item duration (s)
 *   - className: wrapper classes
 *   - onAnimationComplete: callback when finished
 */
export default function BlurText({
  text,
  delay = 0,
  animateBy = "words",
  direction = "top",
  duration = 0.6,
  className = "",
  onAnimationComplete,
}) {
  const ref = useRef(null);

  const children = useMemo(() => {
    // If animate by words (recommended), explode JSX or string to word spans
    if (animateBy === "words") {
      return explodeToWordSpans(text);
    }

    // Fallback: char-splitting only works for plain strings
    if (typeof text === "string") {
      return [...text].map((ch, i) => (
        <span
          key={`c-${i}`}
          data-char
          className="inline-block will-change-transform will-change-filter"
          style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
        >
          {ch}
        </span>
      ));
    }

    // If non-string + animateBy="chars", just animate as a single block
    return <span data-block>{text}</span>;
  }, [text, animateBy]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const selector =
      animateBy === "words"
        ? "[data-word]"
        : animateBy === "chars"
        ? "[data-char]"
        : "[data-block]";

    const nodes = root.querySelectorAll(selector);

    const offset =
      direction === "top"
        ? 12
        : direction === "bottom"
        ? -12
        : direction === "left"
        ? 14
        : -14;

    const translate =
      direction === "left" || direction === "right"
        ? [`translateX(${offset}px)`, "translateX(0px)"]
        : [`translateY(${offset}px)`, "translateY(0px)"];

    const controls = animate(
      nodes,
      {
        opacity: [0, 1],
        filter: ["blur(8px)", "blur(0px)"],
        transform: translate,
      },
      {
        delay: stagger(0.08, { start: delay / 1000 }),
        duration,
        easing: "cubic-bezier(.2,.7,.3,1)",
      }
    );

    controls.finished.then(() => onAnimationComplete?.());
    return () => controls.cancel();
  }, [delay, animateBy, direction, duration, onAnimationComplete]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
