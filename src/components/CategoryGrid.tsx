"use client";

import React from "react";
import Image from "next/image";

interface Category {
  name: string;
  image: string;
}

export default function CategoryGrid() {
  const categories: Category[] = [
    { name: "Cleansers", image: "/category-cleansers.png" },
    { name: "Serums", image: "/category-serums.png" },
    { name: "Moisturizers", image: "/category-moisturizers.png" },
    { name: "Sun Care", image: "/mineral-sunscreen.png" },
    { name: "Toners", image: "/niacinamide-toner.png" },
    { name: "Sets & Kits", image: "/hero-products.png" },
    { name: "New Arrivals", image: "/coconut-body-butter.png" },
  ];

  // We duplicate the categories array to create a seamless infinite loop marquee effect
  const marqueeItems = [...categories, ...categories];

  return (
    <section id="collections" className="w-full py-16 md:py-20 bg-transparent border-b border-[#EAE3DC] overflow-hidden select-none">
      
      {/* Section Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center sm:text-left">
        <h2 className="text-xs font-bold tracking-[0.25em] text-[#8C8276] uppercase">
          Shop by Category
        </h2>
      </div>

      {/* Infinite Carousel Container */}
      <div className="relative w-full overflow-hidden">
        
        {/* Left & Right Vignette overlays for soft editorial page fade */}
        <div className="absolute inset-y-0 left-0 w-[10vw] bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[10vw] bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex w-max gap-6 px-6 animate-marquee hover:[animation-play-state:paused]">
          {marqueeItems.map((category, idx) => (
            <button
              key={`${category.name}-${idx}`}
              className="relative aspect-[3/4] w-[140px] sm:w-[170px] rounded-2xl overflow-hidden group border border-[#EAE3DC]/40 shadow-xs hover:shadow-md transition-all duration-500 cursor-pointer shrink-0"
            >
              {/* Category Background Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-w-640px) 150px, 200px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Tint Overlay */}
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-500" />
              
              {/* Soft Bottom-to-Top Vignette */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

              {/* Category Label */}
              <div className="absolute bottom-5 left-5 z-10 flex flex-col items-start space-y-1 text-left">
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-white uppercase">
                  {category.name}
                </span>
                
                {/* Arrow indicator revealing on hover */}
                <div className="flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest">Explore</span>
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
