"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PRODUCTS, Product } from "@/data/products";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirestoreProduct } from "@/app/admin/ProductManager";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

// Carousel Component
const HorizontalProductCarousel = ({
  title,
  subtitle,
  products,
  onAddToCart,
  styleVariant = "default",
}: {
  title: string;
  subtitle: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  styleVariant?: "default" | "featured" | "essentials";
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, { label: string, price: number, image?: string }>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Define styles based on variant
  const bgClass =
    styleVariant === "featured"
      ? "bg-[#FAF6F0]"
      : styleVariant === "essentials"
      ? "bg-[#0D3C6A] text-white"
      : "bg-white";

  const titleColor =
    styleVariant === "essentials" ? "text-white" : "text-[#0D3C6A]";
  const subtitleColor =
    styleVariant === "essentials" ? "text-[#5BA6D6]" : "text-[#00A896]";
  
  const cardBgClass =
    styleVariant === "featured"
      ? "bg-transparent border-none shadow-none"
      : styleVariant === "essentials"
      ? "bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl"
      : "bg-white border border-[#B0B7C3]/60 rounded-2xl";
      
  const cardTextColor =
    styleVariant === "essentials" ? "text-white" : "text-[#0D3C6A]";
  const cardDescColor =
    styleVariant === "essentials" ? "text-white/70" : "text-[#00A896]";
  const cardImageBgClass =
    styleVariant === "featured"
      ? "bg-[#EAE4D9] rounded-2xl overflow-hidden shadow-sm"
      : styleVariant === "essentials"
      ? "bg-white/5 rounded-t-2xl overflow-hidden"
      : "bg-[#F5F2EB] rounded-t-2xl overflow-hidden";
      
  const buttonClass =
    styleVariant === "essentials"
      ? "border-white text-white hover:bg-white hover:text-[#0D3C6A]"
      : "border-[#0D3C6A] text-[#0D3C6A] hover:bg-[#0D3C6A] hover:text-white";

  return (
    <div className={`py-12 md:py-20 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 md:gap-0 border-b border-opacity-20 pb-4" style={{ borderColor: styleVariant === 'essentials' ? 'rgba(255,255,255,0.2)' : 'rgba(176,183,195,0.5)' }}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-serif tracking-widest uppercase ${titleColor}`}>
              {title}
            </h2>
            <p className={`text-xs font-semibold tracking-wider mt-1 ${subtitleColor} uppercase`}>
              {subtitle}
            </p>
          </div>
          <a
            href="/shop"
            className={`group flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${titleColor} hover:opacity-70`}
          >
            Explore Collection
            <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className={`snap-start flex-shrink-0 flex flex-col group relative w-[60vw] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] ${cardBgClass}`}
            >
              {/* Special Tag for Featured removed as per request */}
            
              {/* Product Image */}
              <Link href={`/product/${product.id}`} className={`block w-full aspect-[4/5] relative cursor-pointer ${cardImageBgClass}`}>
                <Image data-pin-nopin="true"
                  src={selectedQuantities[product.id]?.image || product.image}
                  alt={product.name}
                  fill
                  sizes="(max-w-640px) 50vw, (max-w-1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>

              {/* Product Info */}
              <div className={`p-4 flex-1 flex flex-col justify-between space-y-4 ${styleVariant === 'featured' ? 'px-1' : ''}`}>
                <div className="space-y-1.5 text-left">
                  <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${cardDescColor}`}>
                    {product.category}
                  </span>
                  <div className="flex flex-row items-center justify-between gap-3">
                    <Link href={`/product/${product.id}`} className="hover:opacity-70 flex-1 min-w-0">
                      <h3 className={`font-serif text-xs sm:text-sm font-semibold tracking-wide transition-colors truncate ${cardTextColor}`}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    {product.quantities && product.quantities.length > 0 && (() => {
                      const sizeOptions = product.quantities!.filter(q => !q.label.toLowerCase().includes("pack"));
                      if (sizeOptions.length === 0) return null;
                      return (
                        <div className="inline-block relative flex-shrink-0" onMouseLeave={() => setOpenDropdownId(null)}>
                          <button 
                            onClick={(e) => { e.preventDefault(); setOpenDropdownId(openDropdownId === product.id ? null : product.id); }}
                            className={`flex items-center justify-between bg-white/60 border ${openDropdownId === product.id ? 'border-[#0D3C6A]/50 shadow-sm bg-white' : 'border-[#B0B7C3]/60'} rounded-full pl-3.5 pr-2 py-1.5 min-w-[75px] text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#0D3C6A] hover:bg-white hover:border-[#0D3C6A]/50 transition-all duration-300`}
                          >
                            <span>{sizeOptions.find(o => o.label === selectedQuantities[product.id]?.label) ? selectedQuantities[product.id]?.label : sizeOptions[0]?.label}</span>
                            <svg className={`w-3 h-3 opacity-80 ml-1.5 transition-transform duration-300 ${openDropdownId === product.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                          </button>
                          
                          <div className={`absolute top-full left-0 w-full bg-white border border-[#B0B7C3]/30 rounded-xl shadow-lg z-50 overflow-hidden origin-top transition-all duration-200 ${openDropdownId === product.id ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                            {sizeOptions.map(q => (
                              <button
                                key={q.label}
                                className={`w-full text-left px-3.5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                                  (selectedQuantities[product.id]?.label || sizeOptions[0]?.label) === q.label 
                                    ? 'bg-[#FAF6F0] text-[#0D3C6A]' 
                                    : 'text-[#0D3C6A]/80 hover:bg-[#FAF6F0]/50 hover:text-[#0D3C6A]'
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedQuantities(prev => ({ ...prev, [product.id]: q }));
                                  setOpenDropdownId(null);
                                }}
                              >
                                {q.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <p className={`text-[10px] sm:text-[11px] leading-relaxed tracking-wide font-light line-clamp-2 ${cardDescColor}`}>
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`text-xs sm:text-sm font-bold ${cardTextColor}`}>
                    ₹{(selectedQuantities[product.id]?.price || (product.quantities && product.quantities.filter(q => !q.label.toLowerCase().includes("pack"))[0]?.price) || product.price).toFixed(2).replace(/\.00$/, "")}
                  </span>
                  
                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const activeQty = selectedQuantities[product.id] || (product.quantities && product.quantities.filter(q => !q.label.toLowerCase().includes("pack"))[0]);
                      if (activeQty) {
                         onAddToCart({
                           ...product,
                           id: `${product.id}-${activeQty.label}`,
                           name: `${product.name} - ${activeQty.label}`,
                           price: activeQty.price,
                           image: activeQty.image || product.image
                         });
                      } else {
                         onAddToCart(product);
                      }
                    }}
                    aria-label={`Add ${product.name} to cart`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer shadow-xs ${buttonClass}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const prods = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as FirestoreProduct;
        // Apply default quantities for migrated mock products that lack them
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
    }, (err) => console.error("Failed to load home page products", err));
    return () => unsub();
  }, []);

  // Use dynamic products if available, fallback to mock PRODUCTS
  const sourceProducts = dynamicProducts.length > 0 ? dynamicProducts : PRODUCTS;

  // Group the products based on tags/categories to populate 3 sections
  const bestSellers = sourceProducts.slice(0, 6);
  const featured = sourceProducts.filter((p) => p.tag === "HIT");
  const essentials = sourceProducts.filter((p) => ["Cleansers", "Moisturizers", "Toners", "Skincare"].includes(p.category)).slice(0, 6);

  return (
    <section id="shop-sections" className="w-full flex flex-col">
      {/* 1. Best Sellers (Standard Style) */}
      <HorizontalProductCarousel
        title="Best Sellers"
        subtitle="Our most loved formulas"
        products={bestSellers}
        onAddToCart={onAddToCart}
        styleVariant="default"
      />
      
      {/* 2. Featured (Editorial Style) */}
      <HorizontalProductCarousel
        title="Featured Highlights"
        subtitle="Editor's Picks & Trending"
        products={featured}
        onAddToCart={onAddToCart}
        styleVariant="featured"
      />
      
      {/* 3. Skincare Essentials (Dark Glassmorphism Style) */}
      <HorizontalProductCarousel
        title="Skincare Essentials"
        subtitle="Your daily ritual"
        products={essentials}
        onAddToCart={onAddToCart}
        styleVariant="essentials"
      />
    </section>
  );
}
