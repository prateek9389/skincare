"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Product, PRODUCTS } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // Find current product details
  const product = PRODUCTS.find((p) => p.id === id);

  // Cart state sync
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Top Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Auto slide top carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col justify-between pt-20">
        <Header cartItems={cartItems} onUpdateQuantity={() => {}} onRemoveItem={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center space-y-6">
          <h2 className="font-serif text-2xl text-[#1C1B19]">Product Not Found</h2>
          <button
            onClick={() => router.push("/shop")}
            className="text-xs font-bold tracking-widest text-white bg-black px-8 py-3.5 rounded-full uppercase hover:opacity-85"
          >
            Return to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
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

  // Slides structure for top banner
  const slides = [
    {
      leftImage: "/promise-model.png",
      rightImage: product.image,
      textLine1: "GLASSY",
      textLine2: "new collection",
      textLine3: "SKIN",
    },
    {
      leftImage: "/hero-inset-model.png",
      rightImage: "/cream-splash.png",
      textLine1: "PURE",
      textLine2: "botanical extracts",
      textLine3: "HYDRATION",
    },
    {
      leftImage: "/instagram-models.png",
      rightImage: "/instagram-flatlay.png",
      textLine1: "BALANCED",
      textLine2: "daily ritual care",
      textLine3: "ESSENTIALS",
    },
  ];

  // Get 4 other random bestsellers (excluding current product)
  const bestsellers = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

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
        
        {/* 1. TOP CAROUSEL BANNER */}
        <section className="relative w-full h-[65vh] md:h-[75vh] bg-[#EAE3DC]/40 border-b border-[#EAE3DC] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-3 items-stretch"
            >
              {/* Left Column: Close up profile */}
              <div className="relative h-full hidden md:block border-r border-[#EAE3DC]/80 overflow-hidden">
                <Image
                  src={slides[currentSlide].leftImage}
                  alt="Aura Model"
                  fill
                  priority
                  sizes="33vw"
                  className="object-cover opacity-90 scale-105"
                />
              </div>

              {/* Center Column: Text overlay block */}
              <div className="flex flex-col justify-center items-center text-center p-8 bg-[#FAF6F0]/30 relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-[0.1em] text-[#1C1B19] uppercase leading-none">
                    {slides[currentSlide].textLine1}
                  </h2>
                  <p className="font-serif italic text-sm sm:text-base text-[#8C8276] tracking-wide block">
                    {slides[currentSlide].textLine2}
                  </p>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-[0.15em] text-[#1C1B19] uppercase leading-none pt-1">
                    {slides[currentSlide].textLine3}
                  </h2>
                </div>
                {/* Dots indicator */}
                <div className="absolute bottom-6 flex space-x-2">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? "bg-[#1C1B19] w-4" : "bg-[#8C8276]/40"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Jar / Product texture */}
              <div className="relative h-full overflow-hidden">
                <Image
                  src={slides[currentSlide].rightImage}
                  alt="Aura texture closeup"
                  fill
                  priority
                  sizes="(max-w-768px) 100vw, 33vw"
                  className="object-contain p-12 opacity-95"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Categories Tabs layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center sm:justify-start items-center space-x-8 text-xs tracking-widest text-[#8C8276] font-semibold uppercase border-b border-[#EAE3DC] pb-4">
            <span className="text-[#1C1B19] border-b border-[#1C1B19] pb-4 -mb-4 flex items-baseline gap-1 cursor-pointer">
              Skincare <span className="text-[9px] font-light text-neutral-400">14</span>
            </span>
            <span className="hover:text-[#1C1B19] transition-colors flex items-baseline gap-1 cursor-pointer">
              Body & Bath <span className="text-[9px] font-light text-neutral-400">23</span>
            </span>
            <span className="hover:text-[#1C1B19] transition-colors flex items-baseline gap-1 cursor-pointer">
              New Collection <span className="text-[9px] font-light text-neutral-400">7</span>
            </span>
          </div>
        </section>

        {/* 2. MID PRODUCT DISPLAY SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Platform product image */}
            <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 border border-[#EAE3DC]/60 flex items-center justify-center relative aspect-square shadow-sm max-w-xl mx-auto w-full group">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-w-768px) 100vw, 500px"
                  className="object-contain p-6 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Column: Descriptions & Cart triggers */}
            <div className="space-y-8 text-left">
              
              {/* Product header info */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase">
                  {product.category} Collection
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1C1B19] leading-tight tracking-wide">
                  {product.name}
                </h1>
                
                {/* Ingredients tag badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {product.ingredients?.map((ing) => (
                    <span
                      key={ing}
                      className="text-[9px] tracking-wider text-[#1C1B19] border border-[#D4C5B9] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full uppercase"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price and Cart Action row */}
              <div className="flex items-center gap-8 py-6 border-y border-[#EAE3DC]">
                <div className="flex flex-col">
                  <span className="text-[9px] tracking-widest text-[#8C8276] uppercase">Price</span>
                  <span className="font-serif text-2xl font-medium text-[#1C1B19]">${product.price.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="flex-grow text-xs font-bold tracking-widest text-white bg-black py-4 px-8 rounded-full uppercase hover:opacity-85 transition-opacity shadow-lg"
                >
                  Add to Bag
                </button>
              </div>

              {/* Editorial quotes & Textures */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wide text-[#1C1B19] uppercase">
                  Your skin is more than just a surface — it's your story, your shield, your glow.
                </h3>
                <p className="text-xs text-[#8C8276] leading-relaxed font-light">
                  {product.description}. In a world full of stressors, pollution, and fast-paced living, skincare isn't a luxury — it's a necessity. Daily care helps restore balance, protect against environmental damage, and preserve your skin's natural vitality.
                </p>
                
                {/* Smeared cream texture picture */}
                <div className="relative aspect-[3/1] w-full bg-[#FAF6F0] rounded-2xl border border-[#EAE3DC]/40 overflow-hidden mt-6 p-2 flex items-center justify-center">
                  <Image
                    src="/cream-splash.png"
                    alt="Cream Smear Texture"
                    fill
                    sizes="(max-w-768px) 100vw, 500px"
                    className="object-cover opacity-80"
                  />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3. BESTSELLERS INTERLOCKING SECTION */}
        <section className="border-t border-[#EAE3DC] py-16 bg-[#FAF6F0]/25 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-serif text-lg tracking-widest text-[#1C1B19] uppercase mb-12">
              Bestsellers
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {bestsellers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/product/${item.id}`)}
                  className="group flex flex-col space-y-4 text-left cursor-pointer"
                >
                  <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden p-4 border border-[#EAE3DC]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="180px"
                      className="object-contain p-2 opacity-95 group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="font-serif text-xs font-light text-[#1C1B19] tracking-wide line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="font-serif text-xs text-[#1C1B19] whitespace-nowrap">
                      {item.price.toFixed(2)} $
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. BOTTOM RITUAL DETAILS FOOTER PANEL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#EAE3DC]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            {/* Left Box: product collection details */}
            <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 border border-[#EAE3DC] flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold tracking-wider text-[#1C1B19] border border-[#1C1B19] px-3 py-1 rounded-full uppercase">beauty</span>
                  <span className="text-[9px] font-bold tracking-wider text-[#1C1B19] border border-[#1C1B19] px-3 py-1 rounded-full uppercase">care</span>
                  <span className="text-[9px] font-bold tracking-wider text-[#1C1B19] border border-[#1C1B19] px-3 py-1 rounded-full uppercase">comfort</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#1C1B19] font-light leading-tight">
                  Discover the Complete Treatment Series
                </h3>
                <p className="text-xs text-[#8C8276] leading-relaxed">
                  Unlock the full potential of clinical formulas designed to empower, purify, and nourish daily routine cycles.
                </p>
              </div>
              <button
                onClick={() => router.push("/shop")}
                className="self-start text-xs font-bold tracking-widest text-[#1C1B19] border-b border-[#1C1B19] pb-1 uppercase hover:opacity-75"
              >
                go to the catalog &rarr;
              </button>
            </div>

            {/* Right Box: Model Dropper Close-up */}
            <div className="relative rounded-3xl overflow-hidden min-h-[300px] border border-[#EAE3DC]">
              <Image
                src="/hero-inset-model.png"
                alt="Model Applying Serum"
                fill
                sizes="(max-w-768px) 100vw, 500px"
                className="object-cover opacity-90 scale-102 hover:scale-105 transition-transform duration-700"
              />
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
