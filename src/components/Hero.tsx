"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("Aesthetics");
  const tabs = ["Aesthetics", "Comfort", "Care"];

  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-zinc-100 flex flex-col justify-end p-6 sm:p-10 lg:p-14 border-b border-[#EAE3DC]">
      {/* Video Background (New 1920x1080 high-def footage) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Premium Linear Gradient Overlay from bottom-left corner for high-end legibility */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FBF9F6]/95 via-[#FBF9F6]/45 to-transparent pointer-events-none z-5" />

      {/* BOTTOM ROW: Split Layout for text & floating cards positioned on top of the gradient */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">

        {/* Left Side: Headline Text & Floating Ritual Card stacked */}
        <div className="flex flex-col gap-6 max-w-lg items-start">

          {/* Headline Text positioned on the linear gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-4xl lg:text-5xl tracking-tight text-black leading-tight font-light"
          >
            Cosmetics for the <br />
            whole body. <span className="font-bold">For every body.</span>
          </motion.h1>

          {/* Floating Ritual Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-4 max-w-sm flex items-center gap-4 shadow-lg border border-white/50 transform hover:scale-[1.02] transition-all duration-300"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
              <Image
                src="/hero-inset-model.png"
                alt="Aura inspiration model"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] leading-relaxed text-black font-semibold">
                We were inspired by you and wanted to turn everyday care into a special ritual.
              </p>
              <p className="text-[8px] tracking-wide text-black/80 font-bold uppercase">
                In the moment of realizing our value.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Right Side: Glassmorphic Product Highlight Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/50 border border-white/30 backdrop-blur-md shadow-xl rounded-3xl p-4 w-full max-w-[280px] self-end transform hover:scale-[1.02] transition-all duration-300 md:mr-4"
        >

          {/* Tabs row */}
          <div className="flex gap-1.5 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab
                    ? "bg-black text-white"
                    : "bg-white/70 text-black hover:bg-white/95"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Product details */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-black/80 block">
                  [ sale -15% ]
                </span>
                <h3 className="font-serif text-sm font-bold text-black tracking-wide uppercase mt-0.5">
                  Coconut body butter
                </h3>
              </div>

              {/* Top-right link arrow button */}
              <a
                href="#products"
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* Product image container */}
            <div className="w-full aspect-[4/3] bg-white rounded-2xl relative overflow-hidden p-2 flex items-center justify-center border border-white/50">
              <Image
                src="/coconut-body-butter.png"
                alt="Coconut body butter packaging"
                fill
                sizes="250px"
                className="object-contain p-2 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
