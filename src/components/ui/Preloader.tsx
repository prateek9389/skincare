"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleTextEffect } from "./particle-text-effect";

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [hasMounted, setHasMounted] = useState(true);

  useEffect(() => {
    let current = 1;
    const duration = 5500; // Exact 5.5 seconds total tick duration
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      
      // Calculate progress using a non-linear ease-out curve for premium feedback feel
      const percentage = step / totalSteps;
      const easedProgress = Math.round(1 + (100 - 1) * (1 - Math.pow(1 - percentage, 3)));

      if (easedProgress >= 100) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
        }, 500); // Short pause at 100% to let the particle spell form fully
      } else {
        setProgress(easedProgress);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  if (!hasMounted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 0 }}
        animate={isFinished ? { y: "-100%" } : { y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={() => {
          setHasMounted(false);
          onComplete?.();
        }}
        className="fixed inset-0 bg-[#FBF9F6] z-[9999] flex flex-col justify-between p-8 sm:p-12 lg:p-16 select-none overflow-hidden"
      >
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full z-10">
          <div>
            <span className="font-serif text-lg tracking-[0.25em] text-[#1C1B19] uppercase font-light">
              Aura
            </span>
            <span className="text-[7px] tracking-[0.4em] text-[#8C8276] uppercase -mt-1 block">
              Skincare
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#8C8276] uppercase">
            Est. 2026 / Clinically Proven
          </span>
        </div>

        {/* Center Canvas Brand Reveal */}
        <div className="w-full flex-grow flex items-center justify-center relative my-8">
          <ParticleTextEffect words={["AURA", "SKINCARE"]} />
        </div>

        {/* Bottom Details Row */}
        <div className="flex justify-between items-end w-full z-10">
          <div className="space-y-1">
            <span className="text-[8px] font-bold tracking-[0.2em] text-[#8C8276] uppercase block">
              System Loading
            </span>
            <span className="text-xs text-[#1C1B19] font-light tracking-wide block max-w-[200px]">
              Preparing clean formulas & skin therapy diagnostics...
            </span>
          </div>
          
          {/* 1 to 100% Count in Right Bottom Corner */}
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold tracking-[0.2em] text-[#8C8276] uppercase mb-1">
              Loading
            </span>
            <div className="flex items-baseline gap-1 text-[#1C1B19]">
              <span className="font-serif text-5xl sm:text-6xl font-light tabular-nums leading-none">
                {String(progress).padStart(2, "0")}
              </span>
              <span className="text-lg font-light leading-none">%</span>
            </div>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
