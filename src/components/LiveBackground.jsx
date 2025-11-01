// src/components/LiveBackground.jsx
import React, { useEffect, useRef } from "react";

/**
 * Full-page, low-key background video with a soft blur + dark gradient
 * for readability.
 * 
 * ✅ Visuals unchanged
 * ✅ Defensive cleanup — no ".destroy()" errors
 */
export default function LiveBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const vid = videoRef.current;

    // Start playback safely (some browsers block autoplay)
    const playSafely = async () => {
      try {
        await vid.play();
      } catch (err) {
        console.warn("Autoplay blocked:", err);
      }
    };
    if (vid) playSafely();

    return () => {
      // Defensive cleanup (no .destroy() calls)
      try {
        if (vid && typeof vid.pause === "function") vid.pause();
        // Reset playback position
        if (vid) vid.currentTime = 0;
      } catch (err) {
        console.warn("Cleanup warning:", err);
      }
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover opacity-35 blur-[2px] scale-105"
        // Optional still image while loading
        // poster="/video/download (8).jpg"
      >
        {/* Your existing video stays exactly the same */}
        <source src="/video/11999048_1920_1080_25fps.mp4" type="video/mp4" />
      </video>

      {/* Gentle dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/85" />
    </div>
  );
}
