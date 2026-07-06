"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function PromoScrub() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Bind scrolling to vertical progression of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll value to horizontal movement for scroll-parallax marquee
  const x = useTransform(scrollYProgress, [0, 1], ["-10%", "-35%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[450px] sm:h-[500px] lg:h-[550px] bg-[#EAE3DC] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-b border-[#D4C5B9] select-none"
    >
      {/* TOP PILLS ROW (Floating UI elements) */}
      <div className="relative z-20 flex justify-between items-center w-full">
        <span className="px-4 py-1.5 bg-white/90 border border-white/40 text-black rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xs">
          Products
        </span>
        <div className="flex gap-2">
          {["Aesthetics", "Comfort", "Care"].map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 bg-white/90 border border-white/40 text-black rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* MIDDLE ROW: Parallax Giant Text & Splashing Cream Jar */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Giant Scrolling Background Text */}
        <motion.div
          style={{ x }}
          className="whitespace-nowrap font-serif text-[18vw] font-bold text-black uppercase tracking-tighter leading-none select-none z-0"
        >
          the act. the act. the act. the act.
        </motion.div>

        {/* 3D Splashing Cream Jar (Centered in front of text) */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[260px] sm:w-[340px] lg:w-[420px] aspect-square z-10 pointer-events-none drop-shadow-2xl"
        >
          <Image
            src="/cream-splash.png"
            alt="The Act premium body scrub cream splash"
            fill
            priority
            sizes="(max-w-768px) 300px, 450px"
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* BOTTOM ROW: Floating Overlay Card & Search Trigger */}
      <div className="relative z-20 w-full flex items-end justify-between mt-auto">
        {/* Floating details card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg max-w-[200px] sm:max-w-[220px] border border-white/50 space-y-3"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C8276]">
              ( for body )
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-black tracking-wide leading-tight">
              Body scrub <br />
              coconut
            </h4>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs sm:text-sm font-black text-black">8$</span>
            <button
              onClick={() => alert("Exfoliating Coconut Body Scrub added to bag!")}
              className="bg-black hover:bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-widest py-2 px-4 rounded-full transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Buy now
            </button>
          </div>
        </motion.div>

        {/* Circular search sparkle button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/50 hover:scale-105 hover:bg-white transition-all cursor-pointer text-black"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/* Sparkle icon */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.813 15.904L9 21l-.813-5.096L3.09 15.09l5.097-.813L9 9.181l.813 5.096 5.096.813-5.096.814zM19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
