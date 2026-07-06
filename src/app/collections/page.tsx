"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Product, PRODUCTS } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CartItem {
  product: Product;
  quantity: number;
}

const NEW_LINE_PRODUCTS = [
  {
    id: "cream-cleanser",
    name: "Moisturizing Cream",
    description: "With bifidobacteria",
    price: 45.0,
    image: "/cream-cleanser.png",
    category: "Cleansers",
  },
  {
    id: "jaluellicin-cream",
    name: "Moisturizing Cream",
    description: "Rose flower extract",
    price: 34.0,
    image: "/category-moisturizers.png",
    category: "Moisturizers",
  },
  {
    id: "jaluellicin-serum",
    name: "Moisturizing Cream",
    description: "Wormwood extract",
    price: 38.0,
    image: "/category-serums.png",
    category: "Serums",
  },
  {
    id: "niacinamide-toner",
    name: "Moisturizing Cream",
    description: "With sea water",
    price: 40.0,
    image: "/niacinamide-toner.png",
    category: "Toners",
  },
];

export default function CollectionsPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("Shop all");

  // Sync cart with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aura_cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    cartLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (cartLoadedRef.current) {
      localStorage.setItem("aura_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleAddToCart = (productData: typeof NEW_LINE_PRODUCTS[0]) => {
    // Find matching full product reference or compile standard product
    const fullProduct: Product = PRODUCTS.find((p) => p.id === productData.id) || {
      id: productData.id,
      name: productData.name + " - " + productData.description,
      category: productData.category,
      price: productData.price,
      description: productData.description,
      image: productData.image,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === fullProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === fullProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: fullProduct, quantity: 1 }];
    });
    setToastMessage(`✨ Added ${fullProduct.name} to bag.`);
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

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] selection:bg-[#D4C5B9] selection:text-[#1C1B19] relative overflow-x-hidden pt-20">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1C1B19] text-white px-6 py-3.5 rounded-xl shadow-xl text-xs tracking-wider uppercase font-semibold flex items-center gap-3 border border-neutral-800"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <main className="flex-grow select-none">
        
        {/* 1. HERO SECTION (Serene Layout with Video on the Right) */}
        <section className="relative w-full h-[75vh] grid grid-cols-1 md:grid-cols-12 items-stretch border-b border-[#EAE3DC]">
          
          {/* Left Block: Catalog metadata & brand details */}
          <div className="md:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-between items-start bg-[#FAF6F0]/20 text-left relative">
            <div className="flex justify-between items-center w-full text-[10px] tracking-[0.25em] text-[#8C8276] uppercase">
              <span>Aura Skincare</span>
              <span>08 Collections</span>
            </div>

            <div className="space-y-6 my-auto">
              <div className="relative w-28 h-28 bg-[#FAF6F0] rounded-2xl overflow-hidden p-2 border border-[#EAE3DC] shadow-inner">
                <Image
                  src="/category-serums.png"
                  alt="Catalog Preview"
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              </div>
              <button
                onClick={() => router.push("/shop")}
                className="group flex items-center gap-2 text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                Catalog 
                <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Block: Autoplay loop video background */}
          <div className="md:col-span-7 relative overflow-hidden bg-neutral-900 border-l border-[#EAE3DC]/80">
            <video
              src="/hero-bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/20 to-transparent" />
          </div>

          {/* Huge typography title spanning the bottom of the section */}
          <div className="absolute bottom-4 left-0 w-full overflow-hidden pointer-events-none z-10">
            <h1 className="font-serif text-[12vw] tracking-[0.1em] text-[#1C1B19]/90 font-light leading-none text-center uppercase translate-y-4">
              Serene
            </h1>
          </div>
        </section>

        {/* 2. "NEW LINE" SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 border-b border-[#EAE3DC] pb-4">
            <h2 className="font-serif text-3xl font-light tracking-wide text-[#1C1B19]">New line</h2>
            
            {/* Filter buttons on the right */}
            <div className="flex flex-wrap gap-6 text-[10px] font-bold tracking-widest text-[#8C8276] uppercase">
              {["Serum", "Daily cream", "Toner", "Oil", "Shop all"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`hover:text-[#1C1B19] transition-colors pb-1 ${
                    activeFilter === filter ? "text-[#1C1B19] border-b border-[#1C1B19]" : ""
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* 4 product cards (scroll triggers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {NEW_LINE_PRODUCTS.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col space-y-4"
              >
                {/* Image container */}
                <div 
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden p-6 border border-[#EAE3DC]/30 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                  {/* Subtle color overlay tags behind the mockup images to simulate the look of the card background colors */}
                  <div className={`absolute inset-0 opacity-10 transition-opacity group-hover:opacity-15 ${
                    idx === 0 ? "bg-neutral-500" :
                    idx === 1 ? "bg-pink-500" :
                    idx === 2 ? "bg-green-500" : "bg-blue-500"
                  }`} />
                  
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-w-768px) 100vw, 250px"
                    className="object-contain p-4 relative z-10"
                  />
                </div>

                {/* Info and price */}
                <div className="space-y-1.5 px-1">
                  <h4 className="font-serif text-sm font-semibold tracking-wide text-[#1C1B19]">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-[#8C8276] leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-serif text-sm font-medium text-[#1C1B19]">
                      {product.price.toFixed(0)}$
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-[9px] font-bold tracking-widest text-[#1C1B19] border-b border-[#1C1B19] pb-0.5 uppercase hover:opacity-75"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. TYPOGRAPHIC MID SECTION (Sustainable Care with Dropper overlap) */}
        <section className="w-full py-28 bg-[#FAF6F0]/40 border-y border-[#EAE3DC]/75 relative overflow-hidden select-none">
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10 flex flex-col justify-center items-center min-h-[300px]">
            
            {/* Split typography text lines */}
            <h2 className="font-serif text-[7vw] sm:text-[6vw] font-light tracking-[0.25em] text-[#1C1B19] uppercase leading-none text-center">
              SUSTAIN<span className="opacity-0">___</span>LE CARE
            </h2>
            
            <h2 className="font-serif text-[7vw] sm:text-[6vw] font-light tracking-[0.25em] text-[#1C1B19] uppercase leading-none text-center mt-4">
              FOR RAD<span className="opacity-0">___</span>NT SKIN
            </h2>

            {/* Float details */}
            <div className="flex justify-between w-full max-w-4xl text-[10px] tracking-widest text-[#8C8276] uppercase mt-12 font-medium px-4">
              <span>True beauty comes from harmony</span>
              <span>Natural components</span>
            </div>

            {/* Overlapping/Floating Dropper bottle in the dead center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-72 z-20 pointer-events-none drop-shadow-2xl">
              <Image
                src="/radiance-serum.png"
                alt="Floating Serene Dropper"
                fill
                sizes="176px"
                className="object-contain animate-float"
              />
            </div>

          </div>
        </section>

        {/* 4. PHILOSOPHY SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            
            {/* Left Box: Smiling model photo */}
            <div className="relative rounded-3xl overflow-hidden min-h-[400px] border border-[#EAE3DC]">
              <Image
                src="/instagram-models.png"
                alt="Serene Philosophy Model"
                fill
                sizes="(max-w-768px) 100vw, 550px"
                className="object-cover opacity-90 scale-102 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 text-white font-serif text-3xl font-light italic opacity-95">
                Self Care
              </div>
            </div>

            {/* Right Box: Philosophy description and Shop now button */}
            <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 border border-[#EAE3DC] flex flex-col justify-between space-y-12">
              <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase block">
                  Aura Philosophy
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#1C1B19] font-light leading-tight">
                  Our philosophy
                </h3>
                <div className="space-y-4 text-xs text-[#8C8276] leading-relaxed font-light">
                  <p>
                    We stand for clean, ethical and conscious beauty. Our cosmetics are made with natural ingredients, responsibly sourced and never tested on animals. We care about what goes on your skin and how it affects the planet. Beauty should be kind — to you and to the world around.
                  </p>
                  <p>
                    We dont test on animals and choose sustainable solutions at every step — from sourcing to packaging. Each formula is inspired by the simplicity of nature, designed to nurture both your skin and the planet.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/shop")}
                className="self-start text-xs font-bold tracking-widest text-white bg-black px-10 py-4 rounded-full uppercase hover:opacity-85 transition-all shadow-md"
              >
                Shop now
              </button>
            </div>

          </div>
        </section>

        {/* 5. INFINITE CAROUSEL MARQUEE (Product Shown Marquee) */}
        <section className="w-full py-10 bg-transparent border-t border-[#EAE3DC] overflow-hidden select-none">
          <div className="flex w-max gap-8 px-8 animate-marquee hover:[animation-play-state:paused]">
            {NEW_LINE_PRODUCTS.concat(NEW_LINE_PRODUCTS).map((product, idx) => (
              <div
                key={`${product.id}-marquee-${idx}`}
                onClick={() => router.push(`/product/${product.id}`)}
                className="flex items-center gap-6 bg-[#FAF6F0] border border-[#EAE3DC]/60 px-8 py-4 rounded-2xl cursor-pointer hover:border-[#1C1B19]/30 transition-colors"
              >
                <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden p-1 border border-[#EAE3DC]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-[8px] font-bold text-[#8C8276] uppercase tracking-wider block">
                    {product.category}
                  </span>
                  <span className="font-serif text-xs font-semibold text-[#1C1B19] block">
                    {product.name}
                  </span>
                  <span className="text-[10px] text-[#8C8276] block">
                    {product.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
