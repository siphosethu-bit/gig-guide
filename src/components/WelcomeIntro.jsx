import React from "react";
import BlurText from "./BlurText"; // 👈 make sure this file exists

export default function WelcomeIntro({ onStart, onHowItWorks }) {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/video/download (8).jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[3px] scale-105"
      >
        <source src="/video/1692701-uhd_3840_2160_30fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🌌 Aurora Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>

      {/* ⭐ Foreground Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <p className="text-sm font-medium text-yellow-400 mb-2">
          New • SA Gig Guide
        </p>

        {/* Animated Headline with COLORS */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
          <BlurText
            text={
              <>
                Book <span className="text-pink-400">the vibe.</span>{" "}
                <span className="text-yellow-400">Plan</span> the night.{" "}
                <span className="text-purple-400">Arrive</span> together.
              </>
            }
            delay={150}
            animateBy="words"
            direction="top"
            className="inline-block"
          />
        </h1>

        {/* Animated Subtext */}
        <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
          <BlurText
            text="Browse events by genre and budget, preview the area, set one-tap reminders, and split costs with your crew all in one place."
            delay={650}
            animateBy="words"
            direction="bottom"
            className="inline-block"
          />
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onStart?.({ openRoleGate: true })}
            className="px-6 py-3 rounded-full bg-white/90 text-gray-900 font-semibold shadow-md hover:bg-white transition"
          >
            Get started
          </button>
          <button
            onClick={() => onHowItWorks?.()}
            className="px-6 py-3 rounded-full bg-gray-800/60 text-white font-semibold shadow-md hover:bg-gray-700/70 transition"
          >
            How it works
          </button>
        </div>
      </div>
    </section>
  );
}
