"use client";

import React from "react";
import Image from "next/image";
import { PRODUCTS } from "@/data/products";
import Link from "next/link";

export default function FullscreenExpansion() {
  return (
    <section className="w-full py-20 md:py-28 bg-black text-white relative select-none overflow-hidden">
      {/* Subtle grid pattern background on the black section */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col space-y-12">
        
        {/* 1. Header Area */}
        <div className="text-center px-4 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#8C8276] uppercase">
            Featured Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide">
            The Aura Cabinet
          </h2>
        </div>

        {/* 2. Auto-scrolling Product Cards Carousel (Infinite Marquee) */}
        <div className="w-full overflow-hidden relative py-6">
          
          {/* Left & Right dark vignettes for seamless edge fading */}
          <div className="absolute inset-y-0 left-0 w-[15vw] bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-[15vw] bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* Scrolling track: duplicated lists for wrapping */}
          <div className="flex w-max gap-6 px-6 animate-marquee hover:[animation-play-state:paused]">
            
            {/* First Set of Cards */}
            {PRODUCTS.map((product) => (
              <div
                key={`${product.id}-cabinet-1`}
                className="w-[180px] sm:w-[220px] bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col space-y-4 shrink-0 hover:border-neutral-700 transition-colors duration-300 shadow-xl"
              >
                <Link href={`/product/${product.id}`} className="block relative w-full aspect-[4/3] bg-neutral-950 rounded-xl overflow-hidden p-2 cursor-pointer">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="180px"
                    className="object-contain p-1 opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C8276]">
                    {product.category}
                  </span>
                  <Link href={`/product/${product.id}`} className="hover:underline">
                    <h4 className="font-serif text-xs font-semibold tracking-wide text-white line-clamp-1 cursor-pointer">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="text-[9px] text-white/50 leading-relaxed font-light line-clamp-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-white">${product.price.toFixed(2)}</span>
                  <span className="text-[8px] font-bold text-[#8C8276] uppercase tracking-wider">Premium</span>
                </div>
              </div>
            ))}

            {/* Duplicated Second Set of Cards for Infinite Seamless Loop */}
            {PRODUCTS.map((product) => (
              <div
                key={`${product.id}-cabinet-2`}
                className="w-[180px] sm:w-[220px] bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col space-y-4 shrink-0 hover:border-neutral-700 transition-colors duration-300 shadow-xl"
              >
                <Link href={`/product/${product.id}`} className="block relative w-full aspect-[4/3] bg-neutral-950 rounded-xl overflow-hidden p-2 cursor-pointer">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="180px"
                    className="object-contain p-1 opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C8276]">
                    {product.category}
                  </span>
                  <Link href={`/product/${product.id}`} className="hover:underline">
                    <h4 className="font-serif text-xs font-semibold tracking-wide text-white line-clamp-1 cursor-pointer">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="text-[9px] text-white/50 leading-relaxed font-light line-clamp-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-white">${product.price.toFixed(2)}</span>
                  <span className="text-[8px] font-bold text-[#8C8276] uppercase tracking-wider">Premium</span>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* 3. Footer area with clean quote */}
        <div className="text-center">
          <p className="text-xs text-[#8C8276] tracking-widest uppercase font-light max-w-sm mx-auto">
            Clean care, curated for your daily wellness.
          </p>
        </div>

      </div>
    </section>
  );
}
