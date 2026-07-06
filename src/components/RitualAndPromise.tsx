"use client";

import React, { useRef } from "react";
import { motion, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";

export default function RitualAndPromise() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for 3D card rotation / distortion effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Scroll velocity tracking
  const scrollVelocity = useVelocity(scrollYProgress);
  
  // Spring smoothing for natural settling movement
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 250,
  });

  // Map vertical scrolling speed to 3D rotation and skew angles (FlyingPosters scroll distortion simulation)
  const rotateX = useTransform(smoothVelocity, [-1, 1], [-12, 12]);
  const skewY = useTransform(smoothVelocity, [-1, 1], [-3.5, 3.5]);

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-white border-b border-[#EAE3DC] overflow-hidden"
      style={{ perspective: "1500px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Container - The Ritual (Slides in & Tilts dynamically on scroll) */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              rotateX,
              skewY,
              transformStyle: "preserve-3d",
            }}
            className="bg-[#F5F2EB] rounded-2xl overflow-hidden flex flex-col justify-between border border-[#EAE3DC] h-full shadow-xs hover:shadow-md transition-shadow duration-500"
          >
            <div className="p-8 sm:p-12 space-y-6">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase block">
                The Ritual
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1B19] leading-tight">
                Skincare that <br />
                becomes a <span className="italic font-light">ritual.</span>
              </h2>
              <p className="max-w-md text-xs sm:text-sm text-[#5C554D] leading-relaxed tracking-wide font-light">
                Simple steps. Powerful results. Made to fit effortlessly into
                your everyday routines, giving you a mindful moment to care for your skin.
              </p>
              <div>
                <a
                  href="#products"
                  className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#1C1B19] uppercase border-b border-[#1C1B19] pb-0.5 hover:text-[#8C8276] hover:border-[#8C8276] transition-colors"
                >
                  Explore Collection
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Auto loop muted Video at bottom */}
            <div className="relative h-[250px] sm:h-[320px] w-full mt-auto overflow-hidden border-t border-[#EAE3DC]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="object-cover w-full h-full scale-[1.01]"
              >
                <source src="/ritual-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>

          {/* Right Container - Our Promise (Slides in & Tilts dynamically on scroll) */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              rotateX,
              skewY,
              transformStyle: "preserve-3d",
            }}
            className="bg-[#F5F2EB] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#EAE3DC] h-full shadow-xs hover:shadow-md transition-shadow duration-500"
          >
            
            {/* Text details */}
            <div className="p-8 sm:p-12 flex flex-col justify-center space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase block">
                  Our Promise
                </span>
                <h2 className="font-serif text-2xl text-[#1C1B19] uppercase tracking-wider">
                  Pure Care
                </h2>
              </div>

              <div className="space-y-6">
                
                {/* Promise 1 */}
                <div className="flex gap-4">
                  <div className="text-[#8C8276] shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wide text-[#1C1B19] uppercase">Clean & Safe</h3>
                    <p className="text-[11px] text-[#8C8276] mt-0.5">Free from harmful chemicals, parabens, and sulfates.</p>
                  </div>
                </div>

                {/* Promise 2 */}
                <div className="flex gap-4">
                  <div className="text-[#8C8276] shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wide text-[#1C1B19] uppercase">Sustainable</h3>
                    <p className="text-[11px] text-[#8C8276] mt-0.5">Eco-friendly packaging and responsibly sourced materials.</p>
                  </div>
                </div>

                {/* Promise 3 */}
                <div className="flex gap-4">
                  <div className="text-[#8C8276] shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wide text-[#1C1B19] uppercase">Cruelty Free</h3>
                    <p className="text-[11px] text-[#8C8276] mt-0.5">100% vegan formulations, never tested on animals.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Auto loop muted Video */}
            <div className="relative h-[300px] md:h-full w-full overflow-hidden border-t md:border-t-0 md:border-l border-[#EAE3DC]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="object-cover object-center w-full h-full scale-[1.01]"
              >
                <source src="/promise-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
