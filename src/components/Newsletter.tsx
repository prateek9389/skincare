"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="w-full py-16 md:py-20 bg-black text-white border-t border-neutral-900 overflow-hidden relative">
      {/* Decorative leaf branch SVG on the right */}
      <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden lg:flex items-center justify-end pr-12 text-neutral-800">
        <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 3c-1.5 0-3 1-3.5 2.5C13 4 11.5 3 10 3c-2.5 0-4.5 2-4.5 4.5 0 3.5 4 7.5 8.5 11.5 4.5-4 8.5-8 8.5-11.5C22.5 5 20.5 3 17 3zM14 17.5c-3-2.7-6-5.8-6-8 0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v.5h2v-.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 2.2-3 5.3-6 8z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand logos as seen in (Social Proof) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-neutral-900 pb-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase">
            As Seen In
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xl sm:text-2xl font-serif text-neutral-500 tracking-widest uppercase">
            <span className="hover:text-white transition-colors duration-300">Vogue</span>
            <span className="hover:text-white transition-colors duration-300 font-semibold italic">Bazaar</span>
            <span className="hover:text-white transition-colors duration-300 lowercase font-sans font-light">allure</span>
            <span className="hover:text-white transition-colors duration-300 font-light">Elle</span>
          </div>
        </motion.div>

        {/* Subscribe Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase block">
              Let's Glow Together
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
              Subscribe to get 15% off <br className="hidden sm:inline" />
              your first order
            </h2>
            <p className="text-xs sm:text-sm text-[#8C8276] tracking-wide font-light">
              Receive skincare tips, early access to new product drops, and exclusive offers.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white font-medium tracking-wide">
              ✨ Thank you! Check your inbox for your 15% discount code.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-white outline-hidden rounded-full py-3.5 px-6 text-xs text-white tracking-wider placeholder:text-neutral-600 transition-all shadow-xs"
              />
              <button
                type="submit"
                className="bg-white hover:bg-neutral-200 text-black px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
