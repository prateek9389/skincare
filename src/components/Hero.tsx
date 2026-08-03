"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  mainImage: string;
  heroCategory: string;
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState("Aesthetics");
  const tabs = ["Aesthetics", "Comfort", "Care"];
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const currentSlide = Math.round(scrollPosition / width);
      setActiveSlide(currentSlide);
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), where("isFeatured", "==", true));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          mainImage: doc.data().mainImage,
          heroCategory: doc.data().heroCategory || "Aesthetics",
        }));
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
    };
    fetchFeatured();
  }, []);

  const displayedProducts = featuredProducts.filter((p) => p.heroCategory === activeTab);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (displayedProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayedProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayedProducts.length]);

  // Auto-scroll the background videos every 6 seconds
  useEffect(() => {
    const autoScrollInterval = setInterval(() => {
      if (scrollRef.current) {
        const nextSlide = (activeSlide + 1) % 3; // 3 slides total
        scrollRef.current.scrollTo({
          left: nextSlide * scrollRef.current.clientWidth,
          behavior: 'smooth'
        });
      }
    }, 6000);

    return () => clearInterval(autoScrollInterval);
  }, [activeSlide]);

  const currentProduct = displayedProducts[currentIndex];

  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-zinc-100 border-b border-[#B0B7C3]">
      
      {/* Horizontally Scrolling Background Carousel */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 z-0 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
      >
        
        {/* Slide 1 */}
        <div className="w-full h-full flex-shrink-0 snap-center relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/woman_applying_serum_luxury.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Slide 2 */}
        <div className="w-full h-full flex-shrink-0 snap-center relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/girl_say_somthing_about_product_202608031242.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Slide 3 */}
        <div className="w-full h-full flex-shrink-0 snap-center relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/make_more_realstick_202608031241.mp4" type="video/mp4" />
          </video>
        </div>

      </div>

      {/* Premium Linear Gradient Overlay from bottom-left corner for high-end legibility */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FFFFFF]/95 via-[#FFFFFF]/60 to-transparent pointer-events-none z-5" />

      {/* BOTTOM ROW: Split Layout for text & floating cards positioned on top of the gradient */}
      <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-end pointer-events-none z-10">
        <div className="relative w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 pointer-events-auto">

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
                <video
                  src="/hero-floating-card.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
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
                      ? "bg-[#0D3C6A] text-white"
                      : "bg-white/70 text-[#0D3C6A] hover:bg-white/95"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Product details Carousel */}
            <div className="space-y-3 relative overflow-hidden">
              {displayedProducts.length > 0 && currentProduct ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProduct.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#0D3C6A]/80 block mb-0.5">
                          [ FEATURED ]
                        </span>
                        <Link href={`/product/${currentProduct.id}`} className="hover:underline">
                          <h3 className="font-serif text-sm font-bold text-[#0D3C6A] tracking-wide uppercase line-clamp-1">
                            {currentProduct.name}
                          </h3>
                        </Link>
                      </div>

                      <button
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % displayedProducts.length)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0D3C6A] hover:bg-[#0D3C6A] hover:text-white transition-colors shadow-xs shrink-0 ml-2"
                        aria-label="Next Featured Product"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>

                    <Link href={`/product/${currentProduct.id}`} className="block w-full aspect-[4/3] bg-white rounded-2xl relative overflow-hidden p-2 flex items-center justify-center border border-white/50 cursor-pointer">
                      {currentProduct.mainImage ? (
                        <Image
                          src={currentProduct.mainImage}
                          alt={currentProduct.name}
                          fill
                          sizes="250px"
                          className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <span className="text-xs text-[#BCAE9E]">No Image</span>
                      )}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-60">
                  <div className="w-6 h-6 border-2 border-[#0D3C6A] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[9px] text-[#0D3C6A] font-bold uppercase tracking-widest text-center">Loading<br/>Featured Products</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 pointer-events-auto">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: idx * scrollRef.current.clientWidth,
                  behavior: 'smooth'
                });
              }
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === activeSlide ? "bg-[#0D3C6A] w-6" : "bg-black/20 hover:bg-black/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* CSS to hide scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
