"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import ServicesBento from "@/components/ServicesBento";
import HorizontalScrollGallery from "@/components/HorizontalScrollGallery";
import PromoScrub from "@/components/PromoScrub";
import InstagramBento from "@/components/InstagramBento";
import FullscreenExpansion from "@/components/FullscreenExpansion";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { Product } from "@/data/products";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useScroll, useSpring } from "framer-motion";
import Preloader from "@/components/ui/Preloader";

gsap.registerPlugin(ScrollTrigger);

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);

  // Track page scroll to animate background SVG path
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    // Initially stop scroll interactions during loading screen display
    lenis.stop();

    // Synchronize Lenis scroll position with GSAP ScrollTrigger updates
    lenis.on("scroll", ScrollTrigger.update);

    // Sync GSAP ticker with Lenis frame requests for synchronized refresh rates
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerUpdate);
      lenisRef.current = null;
    };
  }, []);

  // React to loading state transitions to lock/unlock page scroll
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isLoading) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isLoading]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setToastMessage(`✨ ${product.name} added to bag.`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] selection:bg-[#D4C5B9] selection:text-[#1C1B19] relative overflow-x-hidden">
      {/* Curtain Preloader */}
      <Preloader onComplete={() => {
        setIsLoading(false);
        lenisRef.current?.scrollTo(0, { immediate: true });
      }} />

      {/* Header */}
      <Header
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Main Content */}
      <main className="flex-grow relative">
        {/* Background Animated Journey Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 50,0 C 72,15 28,30 72,45 C 28,60 72,75 28,90 L 50,100"
            fill="none"
            stroke="#D4C5B9"
            strokeWidth="0.12"
            strokeDasharray="0.8 0.8"
            style={{ pathLength }}
          />
        </svg>

        <Hero />
        <CategoryGrid />
        <ProductGrid onAddToCart={handleAddToCart} />
        <ServicesBento />
        <HorizontalScrollGallery />
        <PromoScrub />
        <InstagramBento />
        <FullscreenExpansion />
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />

      {/* Custom Premium Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1B19] text-[#FBF9F6] px-6 py-3.5 rounded-xl shadow-xl text-xs font-bold tracking-wider uppercase flex items-center gap-3 animate-fade-in-up border border-[#5C554D]">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8C8276] hover:text-[#FBF9F6] transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
