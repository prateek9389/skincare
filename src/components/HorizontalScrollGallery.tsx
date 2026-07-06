"use client";

import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScrollGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 100ms safety check delay to guarantee full page layout paint before ScrollTrigger initialization
      const timer = setTimeout(() => {
        if (!sectionRef.current || !trackRef.current) return;

        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = trackWidth - viewportWidth;

        if (scrollDistance <= 0) return;

        gsap.to(trackRef.current, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1, // Smooth scrub scrolling
            start: "top top",
            end: () => `+=${scrollDistance}`,
            invalidateOnRefresh: true,
          },
        });
      }, 100);

      return () => clearTimeout(timer);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={sectionRef} 
      className="relative w-full h-screen overflow-hidden bg-[#FBF9F6] border-b border-[#EAE3DC]"
    >
      {/* Horizontal Track Container - Cards take 80% screen (80vw and 80vh) */}
      <div 
        ref={trackRef} 
        className="flex flex-row items-center h-full w-max px-[10vw] gap-8 sm:gap-12 select-none"
      >
        
        {/* CARD 1: Intro Text & Hero Image (80vw / 80vh) */}
        <div className="w-[80vw] h-[80vh] flex-shrink-0 bg-[#F5F2EB] rounded-3xl overflow-hidden border border-[#EAE3DC] shadow-md grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 space-y-6 text-[#1C1B19]">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#8C8276] uppercase block">
              AURA Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1C1B19] leading-tight font-light">
              Alternative rituals <br />
              for <span className="italic font-light">skin health.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#5C554D] leading-relaxed tracking-wide font-light max-w-md">
              Discover our carefully curated products and step-by-step rituals. Scroll horizontally to browse our collection, showing alternating videos and product images.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#1C1B19]">
              <span>Scroll down to slide</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
          <div className="relative h-full w-full bg-[#EAE3DC] pointer-events-none">
            <Image 
              src="/hero-products.png" 
              alt="AURA skincare collection" 
              fill 
              sizes="40vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* CARD 2: Video Panel (Deep Cleansing Loop, 80vw / 80vh) */}
        <div className="w-[80vw] h-[80vh] flex-shrink-0 relative overflow-hidden bg-black rounded-3xl border border-[#EAE3DC] shadow-md">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="object-cover w-full h-full opacity-80 pointer-events-none"
          >
            <source src="/ritual-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute bottom-12 left-12 z-10 text-white space-y-2 pointer-events-none">
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/80 block">[ Step 01 ]</span>
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-wider">Milk Cleansing Ritual</h3>
          </div>
        </div>

        {/* CARD 3: Image Panel (Active Hydration Splash, 80vw / 80vh) */}
        <div className="w-[80vw] h-[80vh] flex-shrink-0 bg-white rounded-3xl border border-[#EAE3DC] shadow-md grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <div className="relative h-full w-full bg-[#EAE3DC] flex items-center justify-center p-8 pointer-events-none">
            <div className="relative w-full max-w-[280px] aspect-square drop-shadow-2xl">
              <Image 
                src="/cream-splash.png" 
                alt="Active hydration splash cream" 
                fill 
                sizes="(max-w-768px) 250px, 350px"
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 space-y-6 text-[#1C1B19]">
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#8C8276] uppercase block">
              Step 02
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-wider">
              Active Hydration
            </h3>
            <p className="text-xs sm:text-sm text-[#5C554D] leading-relaxed font-light max-w-md">
              Locks moisture deep into your cells with organic coconut oil extracts, nourishing squalane, and barrier protection lipid complexes.
            </p>
          </div>
        </div>

        {/* CARD 4: Video Panel (Model Skin Promise Loop, 80vw / 80vh) */}
        <div className="w-[80vw] h-[80vh] flex-shrink-0 relative overflow-hidden bg-black rounded-3xl border border-[#EAE3DC] shadow-md">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="object-cover w-full h-full opacity-80 pointer-events-none"
          >
            <source src="/promise-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute bottom-12 left-12 z-10 text-white space-y-2 pointer-events-none">
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/80 block">[ Step 03 ]</span>
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-wider">Deep Botanical Recovery</h3>
          </div>
        </div>

        {/* CARD 5: Image Panel (Daily Moisturizer Jar, 80vw / 80vh) */}
        <div className="w-[80vw] h-[80vh] flex-shrink-0 bg-[#F5F2EB] rounded-3xl border border-[#EAE3DC] shadow-md grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 space-y-6 text-[#1C1B19]">
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#8C8276] uppercase block">
              Step 04
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-wider">
              Daily Moisturizer
            </h3>
            <p className="text-xs sm:text-sm text-[#5C554D] leading-relaxed font-light max-w-md">
              A rich daily barrier cream that shields the skin from environmental stressors. Instantly calms redness and smooths textured layers.
            </p>
          </div>
          <div className="relative h-full w-full bg-white flex items-center justify-center p-8 pointer-events-none">
            <div className="relative w-full max-w-[260px] aspect-square drop-shadow-xl">
              <Image 
                src="/daily-moisturizer.png" 
                alt="AURA daily moisturizer jar" 
                fill 
                sizes="(max-w-768px) 250px, 350px"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* CARD 6: Video Panel (Skincare Bottle Loop, 80vw / 80vh) */}
        <div className="w-[80vw] h-[80vh] flex-shrink-0 relative overflow-hidden bg-black rounded-3xl border border-[#EAE3DC] shadow-md">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="object-cover w-full h-full opacity-80 pointer-events-none"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B19]/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 z-10 text-white space-y-6 pointer-events-none">
            <span className="text-[10px] font-bold tracking-[0.3em] text-white/80 uppercase block">
              The Aura Pledge
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl italic font-light tracking-wide leading-tight">
              "Pure Ingredients. <br /> Visible Results."
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light max-w-md mx-auto">
              Our products are crafted with clinically proven botanicals and packaged responsibly in recyclable materials.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
