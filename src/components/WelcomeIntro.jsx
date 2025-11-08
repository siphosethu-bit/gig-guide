import React from "react";
import BlurText from "./BlurText";
import Orb from "./Orb";

export default function WelcomeIntro({ onStart, onHowItWorks }) {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Orb background animation */}
      <div
        className="absolute inset-0 z-0 opacity-70 animate-pulse-scale"
        style={{
          animation: "pulseScale 6s ease-in-out infinite",
          transformOrigin: "center center",
        }}
      >
        <Orb
          hue={360}
          hoverIntensity={0.3}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/70 z-10" />

      {/* Foreground content */}
      <div
        className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center justify-between"
        style={{ minHeight: "80vh" }}
      >
        {/* Subheading */}
        <p
          className="amboera-font text-sky-400 mt-0 mb-8"
          style={{ fontSize: "3rem" }}
        >
          <BlurText
            animateBy="words"
            text="Where to.. Next?"
            direction="bottom"
            className="inline-block"
          />
        </p>

        {/* Title — Amsterdam font */}
        <h1
          className="amsterdam-font text-sky-400 leading-none mb-12"
          style={{
            fontSize: "12rem",
            lineHeight: "0.9",
            letterSpacing: "1px",
          }}
        >
          <BlurText
            animateBy="words"
            text="lé Vibe"
            direction="bottom"
            className="inline-block"
          />
        </h1>

        {/* Description + Buttons */}
        <div className="flex flex-col items-center gap-6 mt-4 scale-90">
          <p
            className="text-base sm:text-lg text-gray-200 max-w-xl mx-auto leading-relaxed opacity-90"
            style={{ fontWeight: 300 }}
          >
            <BlurText
              text="Browse events by genre and budget, preview the area, set one-tap reminders, and split costs with your crew all in one place."
              animateBy="words"
              direction="bottom"
              className="inline-block"
            />
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <button
              onClick={() => onStart?.({ openRoleGate: true })}
              className="px-7 py-3 rounded-full bg-white/90 text-gray-900 font-semibold text-base shadow-md hover:bg-white transition"
            >
              Get started
            </button>
            <button
              onClick={() => onHowItWorks?.()}
              className="px-7 py-3 rounded-full bg-gray-800/60 text-white font-semibold text-base shadow-md hover:bg-gray-700/70 transition"
            >
              How it works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
