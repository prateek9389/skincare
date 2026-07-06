"use client";

import React, { useRef } from "react";
import { motion, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";

interface ServiceCardProps {
  title: string;
  videoSrc?: string;
  isWhiteBg?: boolean;
  className?: string;
}

function ServiceCard({ title, videoSrc, isWhiteBg = false, className = "" }: ServiceCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`relative rounded-3xl overflow-hidden group border border-[#EAE3DC] shadow-xs hover:shadow-lg transition-all duration-500 flex flex-col justify-between p-6 select-none ${
        isWhiteBg ? "bg-white text-black" : "bg-zinc-900 text-white"
      } ${className}`}
    >
      {/* Background Video */}
      {videoSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full opacity-70 group-hover:scale-105 transition-transform duration-700"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Subtle vignette layer */}
          <div className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/25" />
        </div>
      )}

      {/* Top Left Title */}
      <div className="relative z-10">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest leading-tight">
          {title}
        </h3>
      </div>

      {/* Bottom Right Arrow Link Icon */}
      <div className="relative z-10 flex justify-end mt-auto">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs ${
          isWhiteBg 
            ? "bg-[#D4C5B9]/20 group-hover:bg-[#1C1B19] text-[#1C1B19] group-hover:text-white" 
            : "bg-white/20 group-hover:bg-white text-white group-hover:text-black"
        }`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesBento() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <section 
      className="w-full py-16 md:py-24 bg-transparent border-b border-[#EAE3DC] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Bento Grid Wrapper */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col gap-6"
        >
          {/* FIRST ROW: 3 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Card 1: Consultations (Tall Card) */}
            <ServiceCard 
              title="Consultations" 
              videoSrc="/ritual-bg.mp4"
              className="md:col-span-1 h-[280px] md:h-[360px]"
            />

            {/* Card 2: Deep Cleansing (Tall Card) */}
            <ServiceCard 
              title="Deep Cleansing" 
              videoSrc="/promise-bg.mp4"
              className="md:col-span-1 h-[280px] md:h-[360px]"
            />

            {/* Card 3 & 4 Right-Side Col (Split row) */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Card 3: Skin Therapy */}
              <ServiceCard 
                title="Skin Therapy" 
                videoSrc="/hero-bg.mp4"
                className="h-[130px] md:h-[168px]"
              />

              {/* Card 4: Peel Treatments */}
              <ServiceCard 
                title="Peel Treatments" 
                videoSrc="/ritual-bg.mp4"
                className="h-[130px] md:h-[168px]"
              />
            </div>

          </div>

          {/* SECOND ROW: 3 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 5: Aesthetic Care */}
            <ServiceCard 
              title="Aesthetic Care" 
              videoSrc="/promise-bg.mp4"
              className="h-[180px] md:h-[220px]"
            />

            {/* Card 6: Active Cosmetics */}
            <ServiceCard 
              title="Active Cosmetics" 
              videoSrc="/hero-bg.mp4"
              className="h-[180px] md:h-[220px]"
            />

            {/* Card 7: Explore Instagram (White card with green arrow) */}
            <ServiceCard 
              title="Explore more on Instagram" 
              isWhiteBg={true}
              className="h-[180px] md:h-[220px]"
            />

          </div>

        </motion.div>
      </div>
    </section>
  );
}
