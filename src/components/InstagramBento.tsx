"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface BentoCard {
  image: string;
  height: string;
  alt: string;
}

const CARDS: BentoCard[] = [
  { image: "/instagram-hands-cream.png", height: "270px", alt: "Applying cream lotion" },
  { image: "/daily-moisturizer.png", height: "180px", alt: "Aura daily moisturizer" },
  { image: "/instagram-models.png", height: "210px", alt: "Models smiling" },
  { image: "/promise-model.png", height: "250px", alt: "Model close-up glowing skin" },
  { image: "/instagram-flatlay.png", height: "240px", alt: "Beauty product flatlay" },
  { image: "/hero-inset-model.png", height: "200px", alt: "Inset portrait model" },
  { image: "/instagram-blue-jar.png", height: "280px", alt: "Opening blue cream gel" },
  { image: "/ritual-story.png", height: "190px", alt: "Ritual skincare pedestal" },
];

export default function InstagramBento() {
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
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
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
    <section className="w-full py-16 md:py-24 bg-transparent border-b border-[#EAE3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={headerVariants}
          className="flex justify-between items-center mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-serif text-[#1C1B19] tracking-tight">
            Follow us on Instagram
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 border border-[#D4C5B9] hover:border-[#1C1B19] rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1C1B19] bg-white transition-colors shadow-xs cursor-pointer"
          >
            @blissful_cosmetics
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </motion.div>

        {/* Bento/Masonry Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="columns-2 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6"
        >
          {CARDS.map((card, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="break-inside-avoid relative rounded-3xl overflow-hidden group border border-[#EAE3DC] cursor-pointer shadow-xs hover:shadow-md transition-shadow duration-300"
              style={{ height: card.height }}
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(max-w-768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Instagram Hover Overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-full text-black transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
