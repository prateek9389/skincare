"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PRODUCTS, Product } from "@/data/products";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirestoreProduct } from "@/app/admin/ProductManager";

interface FullscreenExpansionProps {
  onAddToCart?: (product: Product) => void;
}

export default function FullscreenExpansion({ onAddToCart }: FullscreenExpansionProps) {
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const prods = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as FirestoreProduct;
        const defaultQuantities = [
          { label: "25ml", price: 50 },
          { label: "50ml", price: 100 },
          { label: "100ml", price: 150 }
        ];
        return {
          id: docSnap.id,
          name: data.name || "Unnamed Product",
          category: data.category || "General",
          price: Number(data.price) || 0,
          description: data.description || "",
          image: data.mainImage || "/placeholder.png",
          tag: data.isFeatured ? "HIT" : undefined,
          quantities: data.quantities && data.quantities.length > 0 ? data.quantities : defaultQuantities,
        };
      });
      setDynamicProducts(prods);
    }, (err) => console.error("Failed to load cabinet products", err));
    return () => unsub();
  }, []);

  const displayProducts = dynamicProducts.length > 0 ? dynamicProducts : PRODUCTS;

  return (
    <section className="w-full py-20 md:py-28 bg-black text-white relative select-none overflow-hidden">
      {/* Subtle grid pattern background on the black section */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col space-y-12">
        
        {/* 1. Header Area */}
        <div className="text-center px-4 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#00A896] uppercase">
            Featured Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide">
            The Guna Life Cabinet
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
            {displayProducts.map((product) => (
              <div
                key={`${product.id}-cabinet-1`}
                className="w-[180px] sm:w-[220px] bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col space-y-4 shrink-0 hover:border-neutral-700 transition-colors duration-300 shadow-xl"
              >
                <Link href={`/product/${product.id}`} className="block relative w-full aspect-[4/3] bg-neutral-950 rounded-xl overflow-hidden p-2 cursor-pointer">
                  <Image data-pin-nopin="true"
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="180px"
                    className="object-contain p-1 opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#00A896]">
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
                  <span className="text-xs font-bold text-white">₹{product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-[#00A896] uppercase tracking-wider hidden sm:block">Premium</span>
                    {onAddToCart && (
                      <button
                        onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
                        aria-label={`Add ${product.name} to cart`}
                        className="w-6 h-6 rounded-full border border-white/30 text-white flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-black z-10 cursor-pointer shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Duplicated Second Set of Cards for Infinite Seamless Loop */}
            {displayProducts.map((product) => (
              <div
                key={`${product.id}-cabinet-2`}
                className="w-[180px] sm:w-[220px] bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col space-y-4 shrink-0 hover:border-neutral-700 transition-colors duration-300 shadow-xl"
              >
                <Link href={`/product/${product.id}`} className="block relative w-full aspect-[4/3] bg-neutral-950 rounded-xl overflow-hidden p-2 cursor-pointer">
                  <Image data-pin-nopin="true"
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="180px"
                    className="object-contain p-1 opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#00A896]">
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
                  <span className="text-xs font-bold text-white">₹{product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-[#00A896] uppercase tracking-wider hidden sm:block">Premium</span>
                    {onAddToCart && (
                      <button
                        onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
                        aria-label={`Add ${product.name} to cart`}
                        className="w-6 h-6 rounded-full border border-white/30 text-white flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-black z-10 cursor-pointer shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* 3. Footer area with clean quote */}
        <div className="text-center">
          <p className="text-xs text-[#00A896] tracking-widest uppercase font-light max-w-sm mx-auto">
            Clean care, curated for your daily wellness.
          </p>
        </div>

      </div>
    </section>
  );
}
