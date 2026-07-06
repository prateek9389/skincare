"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PRODUCTS, Product } from "@/data/products";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="products" className="w-full py-16 md:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Animation */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={headerVariants}
          className="flex justify-between items-baseline mb-12 border-b border-[#EAE3DC] pb-4"
        >
          <h2 className="text-sm font-bold tracking-[0.25em] text-[#1C1B19] uppercase">
            Best Sellers
          </h2>
          <a
            href="#"
            className="group flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#1C1B19] uppercase hover:text-[#8C8276] transition-colors"
          >
            View All
            <svg
              className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </motion.div>

        {/* Responsive Grid with Premium Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="flex flex-col bg-white border border-[#EAE3DC]/60 rounded-2xl overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-500 relative"
            >
              {/* Product Image Container (Vertical Editorial Aspect Ratio) */}
              <div className="w-full aspect-[4/5] bg-[#F5F2EB] relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-w-640px) 100vw, (max-w-1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#8C8276]">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-sm font-semibold tracking-wide text-[#1C1B19] group-hover:text-[#BCAE9E] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-[#8C8276] leading-relaxed tracking-wide font-light line-clamp-1">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs sm:text-sm font-bold text-[#1C1B19]">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  {/* Premium Outlined Add Button */}
                  <button
                    onClick={() => onAddToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                    className="w-8 h-8 rounded-full border border-[#1C1B19] hover:bg-[#1C1B19] hover:text-white text-[#1C1B19] flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer shadow-xs"
                  >
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
