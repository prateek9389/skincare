"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Product, PRODUCTS } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORIES = [
  "Cleansers",
  "Serums",
  "Moisturizers",
  "Sun Care",
  "Toners",
  "Body Care",
  "Eye & Lip Care",
];

const INGREDIENTS = [
  "Retinol",
  "Salicylic acid",
  "Vitamin C",
  "Hyaluronic acid",
  "Niacinamide",
  "Vitamin E",
  "Lactic acid",
];

const SKIN_TYPES = ["Dry", "Oily", "Sensitive", "Combination", "Normal"];
const SCENTS = ["Fragrance-Free", "Coconut", "Herbal", "Citrus"];
const CONCERNS = ["Anti-Aging", "Dryness", "Acne", "Redness"];

export default function ShopPage() {
  // Cart state sync
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>("default");

  // Expandable sections in sidebar
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: false,
    skinType: false,
    ingredients: true,
    scent: false,
    concern: false,
  });

  // Display count pagination
  const [displayCount, setDisplayCount] = useState(6);

  // Sync cart with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aura_cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
    cartLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (cartLoadedRef.current) {
      localStorage.setItem("aura_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

  // Helper toggle filter functions
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setDisplayCount(6); // reset pagination on filter change
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
    setDisplayCount(6);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedIngredients([]);
    setSelectedSkinTypes([]);
    setSelectedScents([]);
    setSelectedConcerns([]);
    setDisplayCount(6);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter and Sort logic
  const filteredProducts = PRODUCTS.filter((product) => {
    // Category check
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    // Ingredients check
    if (selectedIngredients.length > 0) {
      const hasIngredient = product.ingredients?.some((ing) =>
        selectedIngredients.includes(ing)
      );
      if (!hasIngredient) return false;
    }
    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    return 0; // default order
  });

  const paginatedProducts = sortedProducts.slice(0, displayCount);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] selection:bg-[#D4C5B9] selection:text-[#1C1B19] relative overflow-x-hidden">
      
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 select-none">
        
        {/* Subtitle Breadcrumb */}
        <div className="flex justify-between items-center text-[10px] tracking-[0.3em] text-[#8C8276] uppercase mb-8 border-b border-[#EAE3DC] pb-4">
          <span>07 CATALOG</span>
          <span>AURA SKINCARE</span>
        </div>



        {/* 2. CATALOG FILTER & GRID ROW */}
        <div className="flex flex-col lg:flex-row gap-12 items-start mt-12">
          
          {/* A. SIDEBAR FILTERS (Left Panel) */}
          <aside className="w-full lg:w-64 space-y-6 lg:sticky lg:top-28 shrink-0 text-left">
            
            {/* Category Filter */}
            <div className="border-b border-[#EAE3DC] pb-4">
              <button
                onClick={() => toggleSection("category")}
                className="w-full flex justify-between items-center text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                <span>Category</span>
                <span className="text-sm">{expandedSections.category ? "−" : "+"}</span>
              </button>
              
              {expandedSections.category && (
                <div className="mt-4 space-y-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 text-xs text-[#8C8276] cursor-pointer hover:text-[#1C1B19] select-none">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-3.5 h-3.5 rounded border-[#D4C5B9] text-[#1C1B19] focus:ring-[#D4C5B9] accent-[#1C1B19]"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="border-b border-[#EAE3DC] pb-4">
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex justify-between items-center text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                <span>Price</span>
                <span className="text-sm">{expandedSections.price ? "−" : "+"}</span>
              </button>
              {expandedSections.price && (
                <div className="mt-4 space-y-2 text-xs text-[#8C8276] leading-relaxed">
                  <p>Filter options are preset to catalog details.</p>
                </div>
              )}
            </div>

            {/* Skin Type Filter */}
            <div className="border-b border-[#EAE3DC] pb-4">
              <button
                onClick={() => toggleSection("skinType")}
                className="w-full flex justify-between items-center text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                <span>Skin Type</span>
                <span className="text-sm">{expandedSections.skinType ? "−" : "+"}</span>
              </button>
              {expandedSections.skinType && (
                <div className="mt-4 space-y-2.5">
                  {SKIN_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-3 text-xs text-[#8C8276] cursor-pointer hover:text-[#1C1B19]">
                      <input
                        type="checkbox"
                        checked={selectedSkinTypes.includes(type)}
                        onChange={() => {
                          setSelectedSkinTypes((prev) =>
                            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                          );
                        }}
                        className="w-3.5 h-3.5 border-[#D4C5B9] accent-[#1C1B19]"
                      />
                      <span>{type} skin</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients Filter */}
            <div className="border-b border-[#EAE3DC] pb-4">
              <button
                onClick={() => toggleSection("ingredients")}
                className="w-full flex justify-between items-center text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                <span>Ingredients</span>
                <span className="text-sm">{expandedSections.ingredients ? "−" : "+"}</span>
              </button>
              
              {expandedSections.ingredients && (
                <div className="mt-4 space-y-3">
                  {INGREDIENTS.map((ing) => (
                    <label key={ing} className="flex items-center gap-3 text-xs text-[#8C8276] cursor-pointer hover:text-[#1C1B19] select-none">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ing)}
                        onChange={() => toggleIngredient(ing)}
                        className="w-3.5 h-3.5 rounded border-[#D4C5B9] text-[#1C1B19] focus:ring-[#D4C5B9] accent-[#1C1B19]"
                      />
                      <span>{ing}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Scent Filter */}
            <div className="border-b border-[#EAE3DC] pb-4">
              <button
                onClick={() => toggleSection("scent")}
                className="w-full flex justify-between items-center text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                <span>Scent</span>
                <span className="text-sm">{expandedSections.scent ? "−" : "+"}</span>
              </button>
              {expandedSections.scent && (
                <div className="mt-4 space-y-2.5">
                  {SCENTS.map((scent) => (
                    <label key={scent} className="flex items-center gap-3 text-xs text-[#8C8276] cursor-pointer hover:text-[#1C1B19]">
                      <input
                        type="checkbox"
                        checked={selectedScents.includes(scent)}
                        onChange={() => {
                          setSelectedScents((prev) =>
                            prev.includes(scent) ? prev.filter((s) => s !== scent) : [...prev, scent]
                          );
                        }}
                        className="w-3.5 h-3.5 border-[#D4C5B9] accent-[#1C1B19]"
                      />
                      <span>{scent}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Concern Filter */}
            <div className="border-b border-[#EAE3DC] pb-4">
              <button
                onClick={() => toggleSection("concern")}
                className="w-full flex justify-between items-center text-xs font-bold tracking-widest text-[#1C1B19] uppercase"
              >
                <span>Concern</span>
                <span className="text-sm">{expandedSections.concern ? "−" : "+"}</span>
              </button>
              {expandedSections.concern && (
                <div className="mt-4 space-y-2.5">
                  {CONCERNS.map((con) => (
                    <label key={con} className="flex items-center gap-3 text-xs text-[#8C8276] cursor-pointer hover:text-[#1C1B19]">
                      <input
                        type="checkbox"
                        checked={selectedConcerns.includes(con)}
                        onChange={() => {
                          setSelectedConcerns((prev) =>
                            prev.includes(con) ? prev.filter((c) => c !== con) : [...prev, con]
                          );
                        }}
                        className="w-3.5 h-3.5 border-[#D4C5B9] accent-[#1C1B19]"
                      />
                      <span>{con}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </aside>

          {/* B. MAIN CATALOG DISPLAY (Right Panel) */}
          <div className="flex-grow w-full space-y-8">
            
            {/* Special Offers Banners - Animated & Dark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Banner 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.015 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-black text-white rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 border border-neutral-950 hover:border-neutral-800 shadow-xl cursor-pointer"
              >
                <div className="space-y-3 text-left">
                  <span className="text-[8px] font-bold tracking-[0.2em] text-[#8C8276] uppercase">New Collection</span>
                  <h3 className="font-serif text-2xl text-white font-light leading-tight">New Serums</h3>
                  <p className="text-[11px] text-[#8C8276] leading-relaxed">
                    Active anti-aging serums targeting skin repair.
                  </p>
                  <span className="inline-block text-[9px] font-bold tracking-widest text-white border-b border-white pb-0.5 uppercase hover:opacity-85">
                    Discover Now
                  </span>
                </div>
                <div className="relative w-28 h-28 shrink-0 bg-neutral-900 rounded-2xl overflow-hidden p-2 border border-neutral-800">
                  <Image
                    src="/category-serums.png"
                    alt="New Serums Offer"
                    fill
                    sizes="112px"
                    className="object-contain p-1 hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Banner 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.015 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-black text-white rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 border border-neutral-950 hover:border-neutral-800 shadow-xl cursor-pointer"
              >
                <div className="space-y-3 text-left">
                  <span className="text-[8px] font-bold tracking-[0.2em] text-[#8C8276] uppercase">Bestsellers</span>
                  <h3 className="font-serif text-2xl text-white font-light leading-tight">Best Ointment</h3>
                  <p className="text-[11px] text-[#8C8276] leading-relaxed">
                    Noni treatment using pure botanical extracts.
                  </p>
                  <span className="inline-block text-[9px] font-bold tracking-widest text-white border-b border-white pb-0.5 uppercase hover:opacity-85">
                    Shop Best
                  </span>
                </div>
                <div className="relative w-28 h-28 shrink-0 bg-neutral-900 rounded-2xl overflow-hidden p-2 border border-neutral-800">
                  <Image
                    src="/instagram-blue-jar.png"
                    alt="Bestselling Ointment"
                    fill
                    sizes="112px"
                    className="object-contain p-1 hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Header filters details & Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EAE3DC]">
              
              {/* Filter breadcrumb tags */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                {(selectedCategories.length > 0 || selectedIngredients.length > 0 || selectedSkinTypes.length > 0 || selectedScents.length > 0 || selectedConcerns.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[10px] font-bold tracking-wider text-[#1C1B19] bg-[#EAE3DC] px-2.5 py-1 rounded uppercase mr-2 hover:opacity-85 transition-opacity"
                  >
                    Clear All
                  </button>
                )}

                {/* Selected category tags */}
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="text-[10px] tracking-wider text-[#1C1B19] border border-[#D4C5B9] px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 cursor-pointer hover:bg-neutral-100"
                  >
                    {cat} <span className="text-[8px] font-bold text-neutral-400">&times;</span>
                  </span>
                ))}

                {/* Selected ingredient tags */}
                {selectedIngredients.map((ing) => (
                  <span
                    key={ing}
                    onClick={() => toggleIngredient(ing)}
                    className="text-[10px] tracking-wider text-[#1C1B19] border border-[#D4C5B9] px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 cursor-pointer hover:bg-neutral-100"
                  >
                    {ing} <span className="text-[8px] font-bold text-neutral-400">&times;</span>
                  </span>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs text-[#8C8276] self-end sm:self-auto">
                <span>SORT BY</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-[#1C1B19] font-semibold py-1 pr-6 pl-1 focus:ring-0 cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>

            </div>

            {/* Empty state check */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 border border-[#EAE3DC] rounded-3xl bg-[#FAF6F0]/40 space-y-4">
                <p className="font-serif text-lg text-[#1C1B19]">No products match selected filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold tracking-widest text-white bg-[#1C1B19] px-6 py-3 rounded-full uppercase hover:opacity-85"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                {/* 3-Column Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group flex flex-col space-y-4 text-left relative"
                    >
                      {/* Product Card Image Container */}
                      <Link href={`/product/${product.id}`} className="block relative w-full aspect-[4/5] bg-[#FAF6F0] rounded-2xl overflow-hidden p-6 border border-[#EAE3DC]/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-w-768px) 100vw, 300px"
                          className="object-contain p-4 opacity-95 group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Left Hit/New Pill */}
                        {product.tag && (
                          <span className="absolute top-4 left-4 text-[7px] font-bold text-white bg-black px-2.5 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm">
                            {product.tag}
                          </span>
                        )}
                      </Link>

                      {/* Details row */}
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-semibold">
                              {product.category}
                            </span>
                            <Link href={`/product/${product.id}`}>
                              <h4 className="font-serif text-sm font-light text-[#1C1B19] tracking-wide line-clamp-1 hover:text-black hover:underline transition-colors cursor-pointer">
                                {product.name}
                              </h4>
                            </Link>
                          </div>
                          <span className="font-serif text-sm text-[#1C1B19] font-medium whitespace-nowrap">
                            {product.price.toFixed(2)} $
                          </span>
                        </div>
                        
                        {/* Quick details */}
                        <p className="text-[10px] text-[#8C8276] line-clamp-1 leading-relaxed font-light">
                          {product.description}
                        </p>
                      </div>

                      {/* Circular add to cart overlay trigger */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        aria-label="Add to bag"
                        className="absolute bottom-12 right-4 w-9 h-9 rounded-full bg-white/95 border border-[#EAE3DC] text-[#1C1B19] flex items-center justify-center shadow hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Display counter text & pagination */}
                <div className="flex flex-col items-center pt-8 border-t border-[#EAE3DC] space-y-4">
                  <span className="text-[10px] tracking-widest text-[#8C8276] uppercase">
                    Showing {Math.min(displayCount, sortedProducts.length)} of {sortedProducts.length} items
                  </span>

                  {displayCount < sortedProducts.length && (
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 6)}
                      className="text-xs font-bold tracking-widest text-white bg-black px-8 py-3.5 rounded-full uppercase hover:opacity-85 transition-opacity shadow-lg"
                    >
                      Load More
                    </button>
                  )}
                </div>
              </>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
